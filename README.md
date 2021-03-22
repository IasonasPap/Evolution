# Evolution

Evolution is an innovative project that aspires to propel the transition to
clean energy resources in transportation. It does that, through an easy-to-use
and flexible interface that facilitates Electric Vehicle (EV) charging via an
online platform. It provides a seamless and smooth experience for customers
that need to find the best available spot for charging, to access the charging
fees of the  stations, to browse offers and many more. Thus, it integrates the
whole procedure of charging into a playful and enjoyable experience on your
device, while abstracting away all the details. You can install the prototype
of the project following the instructions below.

A project for Software Enginnering course at NTUA, ECE, academic year 2020-2021.

## Team Members

| Full Name - Github Account                                     | Email                   |
|----------------------------------------------------------------|-------------------------|
| [Aris Preventis](https://github.com/arisprv)                   | arisprv@gmail.com       |
| [Fay Statha](https://github.com/FayStatha)                     | fay.statha@gmail.com    |
| [Iason Papadimitrakopoulos](https://github.com/IasonasPap)     | jason.pap@hotmail.com   |
| [Lefteris Kritsotakis](https://github.com/lefterisKritsotakis) | elkritsotakis@gmail.com |


## Setup/Usage

### Clone repo

```git clone git@github.com:lefterisKritsotakis/Evolution.git```

### Create virtual environment

```nodeenv -n 10.19.0 --npm=6.14.4 --prebuilt env```

### Activate virtual environment

```. env/bin/activate```

### Install packages

```npm install```

### Install bower

```npm install -g bower```

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

This project is developed with node.js runtime.

### Build Automation:

- nodemon

- npm

- bower

### Testing:

- mocha

- chai

### Cli:

- axios

- yargs

### Frontend:

- angular

### Backend:

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
