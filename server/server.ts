const express = require('express');
const http = require('http');
const { Server, Socket } = require('socket.io');

const app = express();
const server = http.createServer(app);
const cors = require('cors');
var Parser = require('expr-eval').Parser;

var parser = new Parser();

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
app.use(cors());
app.use(
  cors({
    origin: '*', // Replace with the domain you want to allow
    methods: ['GET', 'POST'], // Replace with the HTTP methods you want to allow
    // ...other options
  })
);

const users: Map<string, any> = new Map();
let numbers = [];
let giveUpCounter = 0;
io.on('connection', (socket) => {
  users.set(socket.id, { id: socket.id, username: 'Anonymous', score: 0, ready: false });
  io.emit(
    'leaderboards',
    [...users.values()].sort((a, b) => b.score - a.score)
  );

  socket.on('ready', () => {
    users.set(socket.id, { ...users.get(socket.id), ready: true });
    io.emit(
      'leaderboards',
      [...users.values()].sort((a, b) => b.score - a.score)
    );

    if ([...users.values()].every((user) => user.ready)) {
      numbers = [
        Math.floor(Math.random() * 10) + 0,
        Math.floor(Math.random() * 10) + 0,
        Math.floor(Math.random() * 10) + 0,
        Math.floor(Math.random() * 10) + 0,
      ];
      users.forEach((user) => {
        users.set(user.id, { ...user, ready: false, giveUp: -1, prevWriting: '' });
      });
      giveUpCounter = 0;
      io.emit('new question', {
        goal: 24,
        numbers: numbers,
      });
    }
  });

  socket.on('submit', (answer) => {
    // make sure answer contains each number in numbers array excatly once
    console.log(answer);
    const answerNumbers = (answer.match(/\d/g) ?? []).sort();
    const numbersSorted = [...numbers.sort()];
    const same = answerNumbers.every((value, index) => value === String(numbersSorted[index]));
    if (!same || answerNumbers.length != numbersSorted.length) {
      socket.emit('wrong answer', `Must include every digit exactly once`);
      return;
    }

    // transform sqrt

    let value;
    try {
      value = Parser.evaluate(answer);
      console.log(value);
    } catch (e) {
      socket.emit('wrong answer', 'Badly formed equation');
      return;
    }
    if (value != 24) {
      socket.emit('wrong answer', 'Wrong answer');
      return;
    }

    io.emit('get writings');
    // get writings
    setTimeout(() => {
      users.set(socket.id, { ...users.get(socket.id), score: users.get(socket.id).score + 100 });
      io.emit(
        'leaderboards',
        [...users.values()].sort((a, b) => b.score - a.score)
      );
      io.emit('new question', {
        goal: -1,
        numbers: [],
        prevAnswer: answer,
        prevWinner: socket.id,
      });
    }, 5000);
  });

  socket.on('send writings', (writing) => {
    console.log('setting', writing);
    users.set(socket.id, { ...users.get(socket.id), prevWriting: writing });
  });

  socket.on('give up', () => {
    if (users.get(socket.id).giveUp != -1) {
      return;
    }

    users.set(socket.id, { ...users.get(socket.id), giveUp: giveUpCounter++ });
    giveUpCounter += 1;

    socket.emit('given up');

    if ([...users.values()].every((user) => user.giveUp != -1)) {
      users.forEach((user) => {
        const giveUpIndex = user.giveUp;
        const score = giveUpIndex === 0 ? 100 : 0;
        users.set(user.id, { ...user, giveUp: -1, score: user.score + score });
      });
      io.emit(
        'leaderboards',
        [...users.values()].sort((a, b) => b.score - a.score)
      );
      io.emit('new question', {
        goal: -1,
        numbers: [],
        prevAnswer: 'GIVE UP',
        prevWinner: socket.id,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    users.delete(socket.id);
    io.emit(
      'leaderboards',
      [...users.values()].sort((a, b) => b.score - a.score)
    );
  });
});

server.listen(8000, () => {
  console.log('Listening on *:8000');
});
