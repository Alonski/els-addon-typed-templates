# els-addon-typed-templates
Ember Language Server Typed Templates Addon


How to use?

Install this addon as `dev-dependency` inside your ember project.


### Autocomplete

![autocomplete preview](previews/autocomplete.png)

### Warn Each


![warn each](previews/warn-each.png)

### Unknown Property
![warn unknown](previews/warn-unknown.png)

### Features

* component context autocomplete `{{this.}}`
* component arguments autocomplete `{{@}}`
* warn on udefinded properties (on complete)
* warn on incorrect `each` arguments (not an array)

### NPM
`npm install els-addon-typed-templates --save-dev`

### Yarn
`yarn add els-addon-typed-templates --dev`

### VSCode

Install: [Unstable Ember Language Server](https://marketplace.visualstudio.com/items?itemName=lifeart.vscode-ember-unstable).

* Restart `VSCode`.

## Usage

Try type `{{this.}}` or `{{@}}` inside component template.


## Is it stable?

* sometimes it may crash your language server, don't worry.

