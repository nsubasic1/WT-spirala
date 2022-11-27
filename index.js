const express = require("express");
const bodyParser = require("body-parser");
var fs = require('fs');

const db = require('./db.js');
const { json } = require("express");



const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('public/html'));
app.use(express.static('public/css'));
app.use(bodyParser.text())

app.get("/vjezbe", function (req, res) {
    db.vjezba.findAll().then(function (vjezbe) {
        obj = {};
        zadaci = []
        obj.brojVjezbi = vjezbe.length
        db.zadatak.findAll().then(function (zad) {
            vjezbe.forEach(element => {
                zadaci.push(zad.filter(z => z.VjezbaId == element.id).length)
            });
            obj.brojZadataka = zadaci
            console.log(obj)
            res.json(obj)
        })
    })
})

app.post("/vjezbe", function (req, res) {
    let json = req.body;
    let brVj = parseInt(json.brojVjezbi);
    let greske = [];
    if (brVj < 1 || brVj > 15) greske.push("brojVjezbi");
    let brVj1 = json.brojZadataka.length
    if (brVj1 != brVj) greske.push("brojZadataka");
    for (let i = 0; i < json.brojZadataka.length; i++)
        if (parseInt(json.brojZadataka[i]) < 0 || parseInt(json.brojZadataka[i]) > 10)
            greske.push("z" + i);
    if (greske.length != 0)
        res.json({ status: "error", data: "Pogrešan parametar " + greske.join(",") })
    else {
        db.zadatak.destroy({ where: {}, truncate: { cascade: true } }).then(function () {
            db.vjezba.destroy({ where: {}, truncate: { cascade: true } }).then(function () {
                vjezbePromise = []
                for (let i = 0; i < json.brojVjezbi; i++) {
                    vjezbePromise.push(db.vjezba.create({ brojZadataka: json.brojZadataka[i] }))
                }
                Promise.all(vjezbePromise).then(function (vjezbe) {
                    zadaciPromise = []
                    vjezbe.forEach(vjezba => {
                        for (let i = 0; i < vjezba.brojZadataka; i++) {
                            zadaciPromise.push(db.zadatak.create({ VjezbaId: vjezba.id }))
                        }
                    });
                    Promise.all(zadaciPromise).then(function () {
                        console.log("spaseno")
                        res.json(json)
                    })
                })
            })
        })
    }
})

app.post("/student", function (req, res) {
    let json = req.body
    db.student.findOne({ where: { index: req.body.index } }).then(function (student) {
        if (student != null) res.json({ status: "Student sa indexom " + req.body.index + " već postoji!" })
        else if(json.ime == "" ||json.prezime == "" || json.grupa == "" ||json.index == "") res.json({status: "Informacije o studentu ne mogu biti prazne"})
        else {
            db.grupa.findOrCreate({ where: { naziv: json.grupa } }).then(function (grupa) {
                db.student.create({ ime: json.ime, prezime: json.prezime, index: json.index, grupa: json.grupa, GrupaId: grupa[0].id }).then(function () {
                    console.log("uspjesno kreiran student sa grupom")
                    res.json({ status: "Kreiran student!" })
                })
            })
        }
    })
})

app.put("/student/:index", function (req, res) {
    let index = req.params.index
    console.log(index)
    db.student.findOne({ where: { index: index } }).then(function (student) {
        if (student == null) {
            res.json({ status: "Student sa indexom " + index + " ne postoji" })
            return
        }
        if(req.body.grupa == ""){
            res.json({status : "Grupa ne može biti prazna"})
            return
        }
        db.grupa.findOrCreate({ where: { naziv: req.body.grupa } }).then(function (grupa) {
            student.update({ grupa: req.body.grupa, GrupaId : grupa[0].id }).then(function (student) {
                student.save().then(function (student) {
                    res.json({ status: "Promijenjena grupa studentu " + student.index })
                })
            })

        })
    })
})

app.post("/batch/student", function (req, res) {
    console.log(req.body)
    let lines = req.body.split('\n')

    let studentiPromise = []
    let postoje = []
    let n = 0;
    let redovi = []
    lines.forEach(line => {
        let data = line.split(',')
        console.log(data)
        if (data.length == 4 && data.filter(x=>x.trim()!="").length == 4) {
            studentiPromise.push(db.student.findOne({ where: { index: data[2] } }))
            redovi.push(line)
        }
    });
    Promise.all(studentiPromise).then(function (studenti) {
        let kreiratiStudente = []
        for (let i = 0; i < redovi.length; i++) {
            let data = redovi[i].split(',')
            let unesen = 0
            for(let j = 0; j < i ; j++)
                if(redovi[j].split(',')[2] == data[2]) unesen = 1
            if (studenti[i] == null && unesen == 0) {
                kreiratiStudente.push(db.student.create({ ime: data[0], prezime: data[1], index: data[2], grupa: data[3] }))
                n += 1
            }
            else postoje.push(data[2])
        }
        Promise.all(kreiratiStudente).then(function (stud) {
            let grupePromise = []
            console.log(stud)
            stud.forEach(student => {
                grupePromise.push(db.grupa.findOne({ where: { naziv: student.grupa } }))
            })
            Promise.all(grupePromise).then(function (grupe) {
                let dodajGrupe = []
                for(let i = 0; i < grupe.length; i++){
                    let unesena = 0
                    for(let j = 0; j < i; j++)
                        if(stud[j].grupa == stud[i].grupa) unesena = 1
                    if(grupe[i] == null && unesena == 0) dodajGrupe.push(db.grupa.create({naziv : stud[i].grupa}))
                }
                Promise.all(dodajGrupe).then(function(){
                    if (postoje.length > 0) res.json({ status: "Dodano " + n + " studenata, a studenti " + postoje.join(',') + " već postoje!" })
                res.json({ status: "Dodano " + n + " studenata!" })
                })
                
            })
        })
    })
})

let server = app.listen(3000);

module.exports = server