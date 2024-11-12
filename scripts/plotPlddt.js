// Function to load and parse CSV
async function loadCSV(file) {
    
    const response = await fetch(file);
    const data = await response.text();
    
    const rows = data.trim().split("\n").map(row => row.split("\t"));
    const headers = rows[0];
    const organisms = [];
    const plddtData = {
        very_low: [],
        low: [],
        confident: [],
        very_high: []
    };

    // Extract rows and organize into separate arrays
    rows.slice(1).forEach(row => {
        organisms.push(row[1]);
        plddtData.very_low.push(parseFloat(row[2]));
        plddtData.low.push(parseFloat(row[3]));
        plddtData.confident.push(parseFloat(row[4]));
        plddtData.very_high.push(parseFloat(row[5]));
    });

    return { organisms, plddtData };
}

// Function to plot the data
async function plotData() {
    const { organisms, plddtData } = await loadCSV('src/proteome_plddt.csv');
    
    const ctx = document.getElementById('plddtChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: organisms,
            datasets: [
                {
                    label: 'Very Low Confidence',
                    data: plddtData.very_low,
                    backgroundColor: 'orange',
                },
                {
                    label: 'Low Confidence',
                    data: plddtData.low,
                    backgroundColor: 'yellow',
                },
                {
                    label: 'Confident',
                    data: plddtData.confident,
                    backgroundColor: 'lightblue',
                },
                {
                    label: 'Very High Confidence',
                    data: plddtData.very_high,
                    backgroundColor: 'darkblue',
                }
            ]
        },
        options: {
            responsive: true,
            indexAxis: 'y',  // Set horizontal orientation
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Stacked bar plot of pLDDT means by Organism'
                },
                
            },
            scales: {
                x: {
                    stacked: true,
                    max:1,
                    title: {
                        display: true,
                        text: 'Organism Name'
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'PLDDT Distribution'
                    }
                }
            }
        }
    });
}

plotData();
