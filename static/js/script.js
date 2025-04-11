let measurementsChart;

// Remove the constants and use CONFIG object
async function saveMeasurementToGist(measurement) {
    const measurements = await loadMeasurementsFromGist();
    measurements.unshift(measurement);
    const limitedMeasurements = measurements.slice(0, 5);
    
    const content = JSON.stringify(limitedMeasurements, null, 2);
    
    const response = await fetch(`https://api.github.com/gists/${CONFIG.GIST_ID}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            files: {
                'measurements.json': {
                    content: content
                }
            }
        })
    });

    if (!response.ok) {
        throw new Error('Failed to save measurement');
    }
}

async function loadMeasurementsFromGist() {
    try {
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        const data = await response.json();
        const content = data.files['measurements.json'].content;
        return JSON.parse(content);
    } catch (error) {
        console.error('Error loading measurements:', error);
        return [];
    }
}

// Modify updateMeasurementTable to use the new async function
async function updateMeasurementTable() {
    const measurements = await loadMeasurementsFromGist();
    const tbody = document.getElementById('measurements');
    tbody.innerHTML = '';

    measurements.forEach(m => {
        const row = tbody.insertRow();
        row.insertCell().textContent = m.username;
        row.insertCell().textContent = m.microscope_size;
        row.insertCell().textContent = `${m.actual_size.toFixed(2)}`;
        row.insertCell().textContent = new Date(m.date_added).toLocaleString();
    });
}

// Modify updateChart to use the new async function
async function updateChart() {
    const measurements = await loadMeasurementsFromGist();
    const ctx = document.getElementById('measurementsChart').getContext('2d');

    if (measurementsChart) {
        measurementsChart.destroy();
    }

    measurementsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: measurements.map(m => new Date(m.date_added).toLocaleTimeString()),
            datasets: [{
                label: 'Actual Size (µm)',
                data: measurements.map(m => m.actual_size),
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Measurement History'
                }
            }
        }
    });
}

function exportData() {
    const measurements = JSON.parse(localStorage.getItem('measurements') || '[]');
    const csv = [
        ['Username', 'Microscope Size (mm)', 'Actual Size (µm)', 'Date'],
        ...measurements.map(m => [
            m.username,
            m.microscope_size,
            m.actual_size.toFixed(2),
            new Date(m.date_added).toLocaleString()
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'specimen_measurements.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function clearData() {
    if (confirm('Are you sure you want to clear all measurements?')) {
        localStorage.removeItem('measurements');
        updateMeasurementTable();
        updateChart();
        document.getElementById('result').textContent = '';
    }
}
 
document.addEventListener('DOMContentLoaded', async () => {
    await updateMeasurementTable();
    await updateChart();
});