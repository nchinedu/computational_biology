# Computational Biology Microscope Calculator

A web-based tool for calculating actual specimen sizes from microscope measurements. This application helps biology students and researchers quickly convert microscope measurements to actual specimen sizes while maintaining a history of their calculations.

## Features

- Calculate actual specimen size from microscope measurements
- Real-time size conversion with magnification factors
- Store and display the last 5 measurements
- Interactive line chart visualization of measurement history
- Export measurement data to CSV format
- Local storage for measurement history
- Responsive design for desktop and mobile use

## How to Use

1. Enter your username
2. Input the microscope measurement (in mm)
3. Select the magnification level
4. Click "Calculate" to get the actual specimen size in micrometers (µm)

## Technical Details

- Built with vanilla JavaScript
- Uses Chart.js for data visualization
- Implements HTML5 Local Storage for data persistence
- Exports data in CSV format for further analysis

## Formula Used

The calculation uses the following formula:
 ```
Actual Size (µm) = (Microscope Size (mm) / Magnification) * 1000

```

## Installation

1. Clone the repository
2. Open `index.html` in a web browser
3. No additional installation or dependencies required

## Data Management

- Stores the last 5 measurements locally
- Data can be exported to CSV format
- Option to clear all stored measurements
- All data is stored in the browser's local storage

## Contributing

Feel free to fork this repository and submit pull requests for any improvements.

## License

MIT License
