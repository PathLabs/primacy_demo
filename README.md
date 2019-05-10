# Primacy GUI
GUI front end for the massively-multiplexed pathogen detection pipeline [Primacy](https://github.com/FofanovLab/Primacy)

## Installing

### Dependencies
Install Conda, and follow the [Primacy](https://github.com/FofanovLab/Primacy) install instructions. Ensure that Primacy is added to your path.

### Binaries
Binaries for Linux, OSX, and Windows are available for download from the releases page.

### Cloning
To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/PathLabs/primacy_demo

# Go into the repository
cd primacy_demo

# Install dependencies
make install

# Run the app
make start

# Clean the node_modules
make clean
```

## Documentation
Docs are available via JSDoc. To create documentation, follow the instructions for cloning the repo and execute:

```
npm run docs
```

HTML docs will then be available for viewing in the docs directory


## Contributors
* Chance Nelson <chance-nelson@nau.edu>
* Austin Kelly <atk678@nau.edu>
* Alex Lacy <al2428@nau.edu>
* Turan Naimey <TuranNaimey@nau.edu>

## Acknowledgements
* Tara Furstenau - [Primacy](https://github.com/FofanovLab/Primacy)
* [DataTables](https://datatables.net/)
