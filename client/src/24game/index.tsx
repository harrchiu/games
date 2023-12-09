import { Box, Button, Input } from '@mui/material';
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Flex from '../Components/Flex';

const socket = io('http://192.168.1.149:8000'); // Adjust this URL to your server's address

const _24game = () => {
  const [equation, setEquation] = useState<string>('');
  const [question, setQuestion] = useState<number[]>([]);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [socketId, setSocketId] = useState<string>('NULL');
  const [error, setError] = useState<string>('');
  const [gaveUp, setGaveUp] = useState(false);

  const [prev, setPrev] = useState<{ prevAnswer: string; prevWinner: string } | null>(null);

  const STATE = question?.length === 0 ? 'WAIT' : 'PLAY';

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connecting');
      setSocketId(socket.id);
    });
    socket.on('new question', (msg) => {
      setGaveUp(false);
      setQuestion(msg.numbers);
      setPrev({ prevAnswer: msg.prevAnswer, prevWinner: msg.prevWinner });
      setEquation('');
    });
    socket.on('get writings', () => {
      console.log('send writing', equation);
      submitWriting();
    });
    socket.on('leaderboards', (msg) => {
      setLeaderboards(msg);
    });
    socket.on('wrong answer', (msg) => {
      setError(msg);
    });
    socket.on('given up', () => {
      setGaveUp(true);
    });
  }, []);

  const submitEquation = () => {
    console.log('eq', equation);
    socket.emit('submit', equation);
  };

  const submitGiveup = () => {
    socket.emit('give up');
  };

  const submitWriting = () => {
    socket.emit('send writings', equation);
  };

  useEffect(() => {
    console.log(prev);
  });

  return (
    <>
      <div style={{ position: 'absolute', margin: 20 }}>You are {socketId}</div>
      <Flex center='both' direction='column' style={{ position: 'absolute', right: 100 }}>
        <h1>Leaderboards</h1>
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <tr>
            {STATE === 'WAIT' && <th>Previous Answers</th>}
            <th>Username</th>
            <th>Score</th>
          </tr>
          {leaderboards.map((entry, index) => {
            const readyString = STATE === 'WAIT' ? (entry.ready ? '(Ready)' : '(Not Ready)') : null;
            return (
              <tr>
                {STATE === 'WAIT' && <td>{entry.prevWriting}</td>}
                <td style={{ color: prev?.prevWinner === entry.id ? 'green' : 'unset' }}>
                  {entry.username} ({entry.id}) {readyString}
                </td>
                <td>{entry.score}</td>
              </tr>
            );
          })}
        </table>
      </Flex>
      <Flex center='both' gap={100} direction='column' style={{ width: '100%', height: '100%' }}>
        {STATE === 'PLAY' ? (
          <Flex direction='column'>
            <h1>{question.join(' ')}</h1>
            <Flex gap={8}>
              <Flex direction='column' gap={4}>
                {error && (
                  <h6 style={{ position: 'absolute', color: 'red', marginTop: 40 }}>{error}</h6>
                )}
                <Input
                  disabled={gaveUp}
                  placeholder='Equation'
                  value={equation}
                  onChange={(event: any) => {
                    setEquation(event.target.value);
                    setError('');
                  }}
                  onKeyDown={(event: any) => {
                    if (event.key === 'Enter') {
                      submitEquation();
                    }
                  }}
                  error={error !== ''}
                />
              </Flex>
              <Button
                disabled={gaveUp}
                variant='contained'
                color='primary'
                onClick={() => {
                  submitEquation();
                }}
              >
                Enter
              </Button>
              <Button
                disabled={gaveUp}
                variant='contained'
                color='primary'
                onClick={() => {
                  submitGiveup();
                }}
              >
                Give up
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Flex direction='column' gap={20}>
            {prev?.prevAnswer && (
              <Flex direction='column' center='both' gap={6}>
                <div style={{ fontWeight: 'bold' }}>Previous answer:</div>
                <div>{prev.prevAnswer}</div>
              </Flex>
            )}
            <Button
              disabled={!leaderboards.find((entry) => entry.id == socketId && !entry.ready)}
              onClick={() => {
                socket.emit('ready');
              }}
              variant='contained'
            >
              Ready
            </Button>
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default _24game;
