// Fetch UniProt data and generate a chart for multiple proteomes
async function fetchData(proteomeIds) {
  const container = document.getElementById('charts-container');
  container.innerHTML = ''; // Clear previous charts

  const proteomeData = [];

  for (const proteomeId of proteomeIds) {
    const url = `https://rest.uniprot.org/uniprotkb/stream?fields=accession%2Creviewed%2Cid%2Cprotein_name%2Cgene_names%2Corganism_name%2Clength%2Corganism_id%2Cxref_proteomes%2Cxref_pdb_full%2Cxref_alphafolddb%2Clineage_ids%2Cdate_sequence_modified&format=tsv&query=%28proteome:${proteomeId}%29`;

    try {
      // Fetch the data
      const response = await fetch(url);
      const data = await response.text();

      // Process the TSV data and store results
      const counts = processData(data);
      proteomeData.push(counts);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // After collecting all proteome data, create a single chart
  createChart(proteomeData, container);
}

// Process the fetched TSV data
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
  };
}

// Create a grouped bar chart using Chart.js
function createChart(proteomeData, container) {
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // Prepare data for the chart
  const labels = proteomeData.map(item => item.Organism);
  const entriesData = proteomeData.map(item => item.Entries);
  const afdbData = proteomeData.map(item => item['AFDB Structures']);
  const pdbData = proteomeData.map(item => item['PDB Structures']);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Total unique accessions',
        data: entriesData,
        backgroundColor: '#BDB8AD'
      },
      {
        label: 'AFDB Structures',
        data: afdbData,
        backgroundColor: '#44749D'
      },
      {
        label: 'PDB Structures',
        data: pdbData,
        backgroundColor: '#C6D4E1'
      }
    ]
  };

  const options = {
    responsive: true,
    indexAxis: 'y',  // Set horizontal orientation
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: '# of Unique Entries'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Organism'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Proteome Coverage by Organism'
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            const datasetLabel = tooltipItem.dataset.label || '';
            const value = tooltipItem.raw;
            return `${datasetLabel}: ${value}`;
          }
        }
      }
    }
  };

  // Create the grouped bar chart
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
  "UP000008153",
  "UP000000535",
  "UP000006548",
  "UP000005640",
  "UP000001940"
]);

