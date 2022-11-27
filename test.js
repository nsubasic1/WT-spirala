const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp)
chai.should()
let assert = chai.assert;

const server = require('./index.js')
const Sequelize = require('sequelize')
const db = require('./db.js')



describe('Testovi za POST /student', function () {

    it('Ispravni podaci', function (done) {
        db.sequelize.sync({ force: true }).then(function () {
            chai.request(server)
                .post('/student')
                .set('content-Type', 'application/json')
                .send({ ime: "nejla", prezime: "subasic", index: "12121", grupa: "grupica" })
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.status.should.eql("Kreiran student!")
                    db.student.findAll().then((studenti) => {
                        studenti.should.have.lengthOf(1, "Treba biti upisan jedan student")
                        studenti[0].ime.should.eql("nejla")
                        studenti[0].prezime.should.eql("subasic")
                        studenti[0].index.should.eql("12121")
                        studenti[0].grupa.should.eql("grupica")
                        db.grupa.findAll().then(function (grupe) {
                            grupe[0].naziv.should.eql("grupica")
                        }).then(function () {
                            done()
                        })
                    })
                })
        })
    })

    it('Student vec postoji', function (done) {
        chai.request(server)
            .post('/student')
            .set('content-Type', 'application/json')
            .send({ ime: "nejla", prezime: "subasic", index: "12121", grupa: "grupica" })
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.status.should.eql("Student sa indexom 12121 već postoji!")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(1, "Treba biti upisan jedan student")
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(1)
                    }).then(function () {
                        done()
                    })
                })
            })
    })

    it('Prazno ime', function (done) {
        chai.request(server)
            .post('/student')
            .set('content-Type', 'application/json')
            .send({ ime: "", prezime: "subasic", index: "123", grupa: "grupica" })
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.status.should.eql("Informacije o studentu ne mogu biti prazne")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(1, "Treba biti upisan jedan student")
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(1)
                    }).then(function () {
                        done()
                    })
                })
            })
    })

    it('Prazno prezime', function (done) {
        chai.request(server)
            .post('/student')
            .set('content-Type', 'application/json')
            .send({ ime: "vwafwadfv", prezime: "", index: "123", grupa: "grupica" })
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.status.should.eql("Informacije o studentu ne mogu biti prazne")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(1, "Treba biti upisan jedan student")
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(1)
                    }).then(function () {
                        done()
                    })
                })
            })
    })

    it('Prazna grupa', function (done) {
        chai.request(server)
            .post('/student')
            .set('content-Type', 'application/json')
            .send({ ime: "wdfqwd", prezime: "subasic", index: "123", grupa: "" })
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.status.should.eql("Informacije o studentu ne mogu biti prazne")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(1, "Treba biti upisan jedan student")
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(1)
                    }).then(function () {
                        done()
                    })
                })
            })
    })
})

describe('Testovi za PUT /student/:index', function () {

    it("Postavljanje nepostojece grupe", function (done) {
        chai.request(server)
            .put('/student/12121')
            .set('content-Type', 'application/json')
            .send({ grupa: "test" })
            .end(function (err, res) {
                console.log(err)
                res.should.have.status(200);
                res.body.status.should.eql("Promijenjena grupa studentu 12121")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(1, "Treba biti upisan jedan student")
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(2)
                        grupe[1].naziv.should.eql("test")
                    }).then(function () {
                        done()
                    })
                })
            })
    })

    it("Postavljanje postojece grupe", function (done) {
        chai.request(server)
            .put('/student/12121')
            .set('content-Type', 'application/json')
            .send({ grupa: "grupica" })
            .end(function (err, res) {
                console.log(err)
                res.should.have.status(200);
                res.body.status.should.eql("Promijenjena grupa studentu 12121")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(1, "Treba biti upisan jedan student")
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(2)
                    }).then(function () {
                        done()
                    })
                })
            })
    })

    it("Postavljanje grupe nepostojećem studentu", function (done) {
        chai.request(server)
            .put('/student/123')
            .set('content-Type', 'application/json')
            .send({ grupa: "grupica" })
            .end(function (err, res) {
                console.log(err)
                res.should.have.status(200);
                res.body.status.should.eql("Student sa indexom 123 ne postoji")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(1, "Treba biti upisan jedan student")
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(2)
                    }).then(function () {
                        done()
                    })
                })
            })
    })

    it("Postavljanje prazne grupe", function (done) {
        chai.request(server)
            .put('/student/12121')
            .set('content-Type', 'application/json')
            .send({ grupa: "" })
            .end(function (err, res) {
                console.log(err)
                res.should.have.status(200);
                res.body.status.should.eql("Grupa ne može biti prazna")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(1, "Treba biti upisan jedan student")
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(2)
                    }).then(function () {
                        done()
                    })
                })
            })
    })
})


describe("Testovi za POST /batch/student", function () {
    this.afterEach(function(done){
        db.sequelize.sync({ force: true }).then(function () {done()})
    })

    it("Dodavanje studenta koji je već u bazi", function (done) {
        chai.request(server)
            .post('/batch/student')
            .set('content-type', 'text/plain')
            .send("test,test,12121,test")
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.status.should.eql("Dodano 0 studenata, a studenti 12121 već postoje!")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(1)
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(2)
                    }).then(function () {
                        done()
                    })
                })
            })
    })


    
    it("Dodavanje svih studenata, dvije grupe", function (done) {
        chai.request(server)
            .post('/batch/student')
            .set('content-type', 'text/plain')
            .send("n,n,1,g1\na,a,2,g2\nb,b,3,g1")
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.status.should.eql("Dodano 3 studenata!")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(3, "Treba biti upisano troje studenata")
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(2)
                    }).then(function () {
                        done()
                    })
                })
            })
    })

    it("Isti indexi u CSV", function(done){
        chai.request(server)
            .post('/batch/student')
            .set('content-type', 'text/plain')
            .send("t,t,4,t\nt1,t1,4,t")
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.status.should.eql("Dodano 1 studenata, a studenti 4 već postoje!")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(1, "Treba biti upisan 1 student")
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(1)
                    }).then(function () {
                        done()
                    })
                })
            })
    })

    it("Isti indexi u CSV, različite grupe, druga se ne dodaje", function(done){
        chai.request(server)
            .post('/batch/student')
            .set('content-type', 'text/plain')
            .send("t,t,4,t\nt1,t1,4,t1")
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.status.should.eql("Dodano 1 studenata, a studenti 4 već postoje!")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(1, "Treba biti upisan 1 student")
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(1)
                        grupe[0].naziv.should.eql("t")
                    }).then(function () {
                        done()
                    })
                })
            })
    })

    it("Razno", function(done){
        chai.request(server)
            .post('/batch/student')
            .set('content-type', 'text/plain')
            .send("nn,nn,12,g1\nmm,mm,123,g1\nbb,bb,12,g2\ncc,cc,12,g3\njj,jj,123,gg")
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.status.should.eql("Dodano 2 studenata, a studenti 12,12,123 već postoje!")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(2)
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(1)
                        grupe[0].naziv.should.eql("g1")
                    }).then(function () {
                        done()
                    })
                })
            })
    })

    it("Ignorišemo studente sa csv formatom", function(done){
        chai.request(server)
            .post('/batch/student')
            .set('content-type', 'text/plain')
            .send("nn,nn,12,g1\nmm,mm,123,g1\nbb,12,g2\ncc,cc,12,g3\njj,jj,123,gg")
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.status.should.eql("Dodano 2 studenata, a studenti 12,123 već postoje!")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(2)
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(1)
                        grupe[0].naziv.should.eql("g1")
                    }).then(function () {
                        done()
                    })
                })
            })
    })

    it("Ignorišemo studente sa blank parametrima", function(done){
        chai.request(server)
            .post('/batch/student')
            .set('content-type', 'text/plain')
            .send("nn,nn,12,g1\nmm,mm,123,  \nbb,      ,12,g2\ncc,cc,12,g3\njj,jj,123,gg")
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.status.should.eql("Dodano 2 studenata, a studenti 12 već postoje!")
                db.student.findAll().then((studenti) => {
                    studenti.should.have.lengthOf(2)
                    db.grupa.findAll().then(function (grupe) {
                        grupe.should.have.lengthOf(2)
                        grupe[1].naziv.should.eql("gg")
                    }).then(function () {
                        done()
                    })
                })
            })
    })


})


