let measurementsChart;

// Add this function near the top with other Gist operations
async function saveMeasurementToGist(measurement) {
    const measurements = await loadMeasurementsFromGist();
    if (Array.isArray(measurement)) {
        // Handle clearing data case
        measurements.length = 0;
    } else {
        // Handle new measurement case
        measurements.unshift(measurement);
    }
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
        const response = await fetch(`https://api.github.com/gists/${CONFIG.GIST_ID}`, {
            headers: {
                'Authorization': `token ${CONFIG.GITHUB_TOKEN}`
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

// Make calculate function globally available
window.calculate = async function() {
    const username = document.getElementById('username').value;
    const microscope_size = parseFloat(document.getElementById('microscope_size').value);
    const magnification = parseInt(document.getElementById('magnification').value);

    if (!username || !microscope_size || !magnification) {
        alert('Please fill in all fields');
        return;
    }

    const actual_size = (microscope_size / magnification) * 1000;
    
    const measurement = {
        username,
        microscope_size,
        actual_size,
        date_added: new Date().toISOString()
    };

    try {
        await saveMeasurementToGist(measurement);
        document.getElementById('result').innerHTML = 
            `✨ Original size of specimen: <strong>${actual_size.toFixed(2)} µm</strong>`;
        await updateMeasurementTable();
        await updateChart();
    } catch (error) {
        console.error('Error saving measurement:', error);
        alert('Error saving measurement. Please try again.');
    }
};

// Make other functions globally available
window.exportData = async function() {
    const measurements = await loadMeasurementsFromGist();
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
};

window.clearData = async function() {
    if (confirm('Are you sure you want to clear all measurements?')) {
        try {
            await saveMeasurementToGist([]);
            await updateMeasurementTable();
            await updateChart();
            document.getElementById('result').textContent = '';
        } catch (error) {
            console.error('Error clearing data:', error);
            alert('Error clearing data. Please try again.');
        }
    }
};
 
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof CONFIG === 'undefined') {
        console.error('Configuration not loaded. Please check config.js');
        return;
    }
    await updateMeasurementTable();
    await updateChart();
});