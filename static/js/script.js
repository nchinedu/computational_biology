let measurementsChart;

function calculate() {
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

    let measurements = JSON.parse(localStorage.getItem('measurements') || '[]');
    measurements.unshift(measurement);
    measurements = measurements.slice(0, 5);
    localStorage.setItem('measurements', JSON.stringify(measurements));

    document.getElementById('result').innerHTML = 
        `✨ Original size of specimen: <strong>${actual_size.toFixed(2)} µm</strong>`;

    updateMeasurementTable();
    updateChart();
}

function updateMeasurementTable() {
    const measurements = JSON.parse(localStorage.getItem('measurements') || '[]');
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

function updateChart() {
    const measurements = JSON.parse(localStorage.getItem('measurements') || '[]');
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

document.addEventListener('DOMContentLoaded', () => {
    updateMeasurementTable();
    updateChart();
});