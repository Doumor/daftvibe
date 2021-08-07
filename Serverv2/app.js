const http = require('http');

const express = require('express');
const app = express();
const port = 3025;
const fileUpload = require('express-fileupload');
const fs = require("fs");

var path = require('path');
var ip = require('ip');
var mongo = require('mongodb');
const assert = require('assert');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId
var request = require('request');
var ffmpeg = require('fluent-ffmpeg');
var bodyParser = require('body-parser')

var deleteTime = 1000*60*24

mongoose.connect('mongodb://localhost/daftvibeipfs', {
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
    // Подключение установлено+
    console.info("Succesfully connected to MongoDB Database");
});

const SongsSchema = new Schema({ //Схема песенки и юзера
  _id: Schema.Types.ObjectId,
  country: String,
  song: String,
  date: Number,
  endDate: Number
});

var Song = mongoose.model('Songs', SongsSchema);

app.use(bodyParser.urlencoded({ extended: false })) //Парсер

app.get('/upload',(req, res) => { //Форма отправки
  res.send('<form action="/upload" method="post"> <input name="song" type="text" /> <input name="country" type="text" /> <input type="submit" value="Submit"> </form>')
});

app.post('/upload',(req, res) => { //От
  var songUrl = req.body.song.split('?', 1)
  songUrl = songUrl[0]
  request({method: 'HEAD', uri: songUrl}, function (error, response, body) { //Проверка доступности.
    if (!error && response.statusCode == 200) {
      ffmpeg.ffprobe(songUrl,function(err, metadata) { //Проверка кодеков
          if (err) throw err;
          var audioCodec = null;
          var videoCodec = null;
          metadata.streams.forEach(function(stream){
              if (stream.codec_type === "video")
                  videoCodec = stream.codec_name;
              else if (stream.codec_type === "audio")
                  audioCodec = stream.codec_name;
          });
          //console.log(videoCodec, audioCodec);
          if(audioCodec == 'mp3'){
            Song.findOne({ //Ищет загружена ли эта песенка
              song: songUrl
            }).exec(function(err, Songs){
              if (err) throw err;
              if(Songs != null){
                Songs.deleteOne({ //Удалает, если загружена
                  song: songUrl,
                }).catch(function(error){
                  console.log(error);
                });
              }
            });

            var country //Инициализация страны
            if(req.body.country == null || req.body.country == undefined || req.body.country == 'null' || req.body.country == ''){
              country = 'Nowhere'
            }
            else {
              country = req.body.country
            }

            var NewSong = new Song ({ //Форма псенки
              _id: new mongoose.Types.ObjectId(),
              country: country,
              song: songUrl,
              date: Date.now(),
              endDate: Date.now() + deleteTime
            });

            NewSong.save(function(err){ //Сохранение песенки
              if(err) throw err;
            });
            res.send('Ok')
          }
          else {
            res.send('WrongType')
          }
      });
    }
    else {
      res.send('ERROR')
    }
  })
});

app.get('/getsong', (req, res) => { //Получить случайную песенку
  Song.countDocuments().exec(function(err, count){
    if(err) throw err;
    if(count != 0){
      var random = Math.floor(Math.random() * count)

      Song.findOne().skip(random).exec(
        function(err, Songs){
          if(err) throw err;
          res.send({"song": Songs.song, "country": Songs.country});
      });
    }
  });
});

app.get('/', (req, res) =>{
  Song.countDocuments().exec(function(err, count){
    if(err) throw err;
    if(count != 0){
      res.send({"count": count})
    }
  })
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})

var cron = require('cron');
var cronJob = cron.job("0,5,10,15,20,25,30,35,40,45,50,55 * * * *", function(){ //Каждые 0 15 30 45 минут.

  function deleteALL(){ //Удалить неактуальные песенки
    Song.findOne({date: {$lt: Date.now() - (300*1000)}}).exec(function(err, Songs){
      if (err) throw err;
      if(Songs != null){
        request({method: 'HEAD', uri: Songs.song}, function (error, response, body) {
          console.log("sd", response.statusCode)
          console.log("sd", error)
          if (!error && response.statusCode == 200) {
            Songs.updateOne({
              date: Date.now() + (300*1000)
            }).catch(function(err){
              if (err) throw err;
            });
            deleteALL();
          }
          else {
            Songs.deleteOne().catch(function(err){
              if (err) throw err;
            });
            deleteALL();
          }
        });

      }
      else{
        return;
      }
    });
  }
  deleteALL();

  Song.deleteMany({ endDate: { $lt: Date.now() } }).then(function(){
     // Success
   }).catch(function(error){
    console.log(error); // Failure
  });
});
cronJob.start();
