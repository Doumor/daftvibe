const http = require('http');

const express = require('express');
const app = express();
const port = 3000;
const fileUpload = require('express-fileupload');
const fs = require("fs");

var path = require('path');
var ip = require('ip');
var mongo = require('mongodb');
const assert = require('assert');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId

mongoose.connect('mongodb://localhost/daftvibe', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

mongoose.connection.on('error',(err)=>
{
    console.error("Database Connection Error: " + err);
    // Скажите админу пусть включит MongoDB сервер :)
    console.error('Админ сервер MongoDB Запусти!');
    process.exit(2);
});

mongoose.connection.on('connected',()=>
{
    // Подключение установлено
    console.info("Succesfully connected to MongoDB Database");
});

const SongsSchema = new Schema({ //Схема песенки и юзера
  _id: Schema.Types.ObjectId,
  author: String,
  song: String,
  date: Number
});

var Song = mongoose.model('Songs', SongsSchema); //Модель

app.use(fileUpload({limits: { fileSize: 50 * 1024 * 1024 }, useTempFiles : true, tempFileDir : '/tmp/'})); //Инициализация fileUpload
app.use(express.static(path.resolve('./public'))); //ПУбличные файлы в ./piblic

app.get('/getsong', (req, res) => { //Получить случайную песенку
  Song.countDocuments().exec(function(err, count){
    if(err) throw err;
    if(count == 0){

    }
    else {
      var random = Math.floor(Math.random() * count)

      Song.findOne().skip(random).exec(
        function(err, Songs){
          if(err) throw err;
          res.send(Songs.author + ' ' + Songs.song);
      });
    }
  });
});

app.get('/upload',(req, res) => { //Форма отправки
  res.send('<form action="/upload" method="post" encType="multipart/form-data"> <input name="song" type="file" /> <input type="submit" value="Submit"> </form>')
});

app.post('/upload',(req, res) => { //От
  var sn = path.extname(req.files.song.name); //songname
  if((sn == '.mp3' || sn == '.wav' || sn == '.amr' || sn == '.flac' || sn == '.m4a' || sn == '.ogg') && req.files.song.size < 20*1024*1024){ //Good
  Song.findOne({
    author: req.connection.remoteAddress.replace(/^.*:/, '')
  }).exec(function(err, Songs){
    if (err) throw err;


    if(Songs != null){
      Songs.deleteOne({
        author: req.connection.remoteAddress.replace(/^.*:/, '')
      }).catch(function(error){
        console.log(error);
      });

      fs.rmdirSync('./public/' + Songs.author, { recursive: true }, (error) => { if(error){ console.log(error)}});
    }

    var NewSong = new Song ({
      _id: new mongoose.Types.ObjectId(),
      author: req.connection.remoteAddress.replace(/^.*:/, ''),
      song: req.files.song.name,
      date: Date.now()
    });

    NewSong.save(function(err){
      if(err) throw err;
    });


    if (!fs.existsSync('./public/' + req.connection.remoteAddress.replace(/^.*:/, ''))){
        fs.mkdirSync('./public/' + req.connection.remoteAddress.replace(/^.*:/, ''));
    }

    req.files.song.mv('./public/' + req.connection.remoteAddress.replace(/^.*:/, '') + '/' + req.files.song.name);


    console.log(Songs)
  });

  res.send('Good');
  }
  else { //Not Good
    console.log(req.files.song.name);
    res.send('ERROR');
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})

var cron = require('cron');
var cronJob = cron.job("0,15,30,45 * * * *", function(){ //Каждые 0 15 30 45 минут.
  var dd = Date.now() - (3600*1000);
  //console.log(dd);

  function deleteALL(){
    Song.findOne({date: {$lt: dd}}).exec(function(err, Songs){
      if (err) throw err;
      //console.log(Songs);
      //console.log(dd);
      if(Songs != null){
        Songs.deleteOne({
          date: {$lt: dd}
        }).catch(function(error){
          //console.log(error);
        });

        fs.rmdir('./public/' + Songs.author, { recursive: true }, (error) => { if(error){ console.log(error)}})
        deleteALL();
      }
    });
  }
  deleteALL();

});
cronJob.start();
