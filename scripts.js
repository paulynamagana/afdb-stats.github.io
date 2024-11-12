// Fetch UniProt data and generate the chart for multiple proteomes
async function fetchData(proteomeIds) {
  const container = document.getElementById('charts-container');
  container.innerHTML = ''; // Clear the previous charts

  for (const proteomeId of proteomeIds) {
    const url = `https://rest.uniprot.org/uniprotkb/stream?fields=accession%2Creviewed%2Cid%2Cprotein_name%2Cgene_names%2Corganism_name%2Clength%2Corganism_id%2Cxref_proteomes%2Cxref_pdb_full%2Cxref_alphafolddb%2Clineage_ids%2Cdate_sequence_modified&format=tsv&query=%28proteome:${proteomeId}%29`;

    try {
      // Fetch the data
      const response = await fetch(url);
      const data = await response.text();

      // Process the TSV data
      const counts = processData(data);

      // Create chart container
      const chartContainer = document.createElement('div');
      chartContainer.classList.add('chart-container');  // Add class for styling

      // Create the chart with processed data
      createChart(counts, chartContainer);

      // Append chart container to the main container
      container.appendChild(chartContainer);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}

// Process the fetched TSV data (same function as before)
function processData(tsvData) {
  const lines = tsvData.split('\n');
  let totalSequences = 0;
  let pdbCount = 0;
  let alphafoldCount = 0;
  let organismName = "";

  const headers = lines[0].split('\t');
  const pdbIndex = headers.indexOf('PDB');
  const alphafoldIndex = headers.indexOf('AlphaFoldDB');
  const organismIndex = headers.indexOf('Organism');

  lines.slice(1).forEach(line => {
    const columns = line.split('\t');
    if (columns.length > 1) {
      totalSequences++;

      if (organismName === "" && organismIndex !== -1) {
        organismName = columns[organismIndex];
      }

      if (pdbIndex !== -1 && columns[pdbIndex] && columns[pdbIndex].trim() !== '') {
        pdbCount++;
      }

      if (alphafoldIndex !== -1 && columns[alphafoldIndex] && columns[alphafoldIndex].trim() !== '') {
        alphafoldCount++;
      }
    }
  });

  const alphafoldPercentage = totalSequences > 0 ? (alphafoldCount / totalSequences) * 100 : 0;
  const pdbPercentage = totalSequences > 0 ? (pdbCount / totalSequences) * 100 : 0;

  return {
    "Organism": organismName,
    "Entries": totalSequences,
    "AFDB Structures": alphafoldCount,
    "PDB Structures": pdbCount,
    "AFDB Percentage": alphafoldPercentage,
    "PDB Percentage": pdbPercentage
  };
}

// Create a chart using Chart.js
function createChart(counts, chartContainer) {
  const canvas = document.createElement('canvas');
  chartContainer.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  
  const data = {
    labels: ['Entries', 'AFDB Structures', 'PDB Structures'],
    datasets: [{
      data: [counts['Entries'], counts['AFDB Structures'], counts['PDB Structures']],
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
      borderColor: ['#4e73df', '#1cc88a', '#36b9cc'],
      borderWidth: 1,
      //barPercentage: 1, //if I change this to 10 it becomes a single stacked bar
      //categoryPercentage: 1.0
    }]
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title:{
          display: true,
          text: '# of unique entries'}
      }
    },
    plugins: {
      title: {
        display: true,
        text: counts['Organism'] + ' Proteome Coverage', // Set the title dynamically
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            const label = tooltipItem.label;
            const value = tooltipItem.raw;
            let percentage = 0;

            if (label === 'AFDB Structures') {
              percentage = counts['AFDB Percentage'];
            } else if (label === 'PDB Structures') {
              percentage = counts['PDB Percentage'];
            }

            if (!label || label === 'undefined') {
              return `${value}`;
            }

            return `${label}: ${value} (${percentage.toFixed(2)}%)`;
          }
        }
      }
    }
  };

  new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
  });
}

// Call the function with a list of proteome IDs
fetchData([
  "UP000002485", 
  "UP000000806", 
  "UP000000429", 
  "UP000000579",
  "UP000000799",
  "UP000000429",
  "UP000008153",
  "UP000000806",
  "UP000000535",
  "UP000006548",
  "UP000005640"
]);
