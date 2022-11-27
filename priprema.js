const db = require('./db.js')

db.sequelize.sync({ force: true }).then(function () {
    inicializacija().then(function () {
        console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka!");
        process.exit();
    });
});
function inicializacija() {
    var vjezbeListaPromisea = [];
    return new Promise(function (resolve, reject) {
        vjezbeListaPromisea.push(db.vjezba.create({ brojZadataka: 3 }));
        vjezbeListaPromisea.push(db.vjezba.create({ brojZadataka: 5 }));
        Promise.all(vjezbeListaPromisea).then(function (vjezbe) {
            console.log("Dodane vjezbe")
            vjezbe.forEach(vjezba => {
                zadaci = []
                for( let i = 0; i < vjezba.brojZadataka; i++) zadaci.push(db.zadatak.create({}))
                Promise.all(zadaci).then(function(zadaci){
                    vjezba.setZadaci(zadaci)
                    console.log("Zadaci dodani")
                })
            });
        });
    });
}
