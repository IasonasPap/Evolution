# Evolution

A project for Software Enginnering course at NTUA, ECE, academic year 2020-2021.

## Team Members

[Aris Preventis](https://github.com/arispr) -- arisprv@gmail.com 

[Fay Statha](https://github.com/FayStatha) -- fay.statha@gmail.com

[Iason Papadimitrakopoulos](https://github.com/IasonasPap) - jason.pap@hotmail.com

[Lefteris Kritsotakis](https://github.com/lefterisKritsotakis) -- elkritsotakis@gmail.com

## Setup/Usage

### Clone repo

```git clone git@github.com:lefterisKritsotakis/Evolution.git```

### Create virtual environment

```nodeenv -n 10.19.0 --npm=6.14.4 --prebuilt env```

### Activate virtual environment

```. env/bin/activate```

### Install packages

```npm install```

### Link Scripts

```npm link```

### Fire up server

```npm run server```

### CLI

```ev_group31 Scope --param1 value1 [--param2 value2 ...]```

Our cli supports --help to let the user know about the available commands

```ev_group31 --help```

### Fire up Frontend

```npm start```

## Technologies Used

We worked with node.js and npm.


Build Automation:

- nodemon

Testing:

- mocha

- chai

Cli:

- axios

- yargs

Frontend:

- angular

Backend:

- express

- sequelize


## Project Structure

```docs/```

This folder contains the documentation of our project. SRS and StRS documents and also UML Diagrams made with Visual Paradigm Community Edition.

```cli-client/```

This folder contains the code of cli implementation.

```frontend/```

This folder contains the code of frontend implementation.

```backend/```

This folder contains all the code of the backend of our project.
