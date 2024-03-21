import { Box, Button, Input } from '@mui/material';
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Flex from '../Components/Flex';

const socket = io('http://10.0.0.180:8000'); // Adjust this URL to your server's address

const _24game = () => {
  const [equation, setEquation] = useState<string>('');
  const [editUsernameValue, setEditUsernameValue] = useState<string>('');
  const [question, setQuestion] = useState<number[]>([]);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [socketId, setSocketId] = useState<string>('NULL');
  const [error, setError] = useState<string>('');
  const [gaveUp, setGaveUp] = useState(false);
  const [showEditUsernameModal, setShowEditUsernameModal] = useState(false);

  const [prev, setPrev] = useState<{ prevAnswer: string; prevWinner: string } | null>(null);

  const STATE = question?.length === 0 ? 'WAIT' : 'PLAY';

  socket.on('connect', () => {
    console.log('connecting');
    setSocketId(socket.id);
  });
  socket.on('new question', (msg) => {
    setGaveUp(false);
    setQuestion(msg.numbers);
    setPrev({ prevAnswer: msg.prevAnswer, prevWinner: msg.prevWinner });
    setEquation('');
    setError('');
  });
  socket.on('get writings', () => {
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

  return (
    <>
      {/* edit username modal */}
      {showEditUsernameModal && (
        <Flex
          center='both'
          style={{
            position: 'absolute',
            zIndex: 100,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
          onClick={() => {
            setShowEditUsernameModal(false);
          }}
        >
          <div
            style={{
              position: 'absolute',
              justifyContent: 'space-between',
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Flex
              direction='column'
              center='both'
              style={{
                backgroundColor: 'white',
                boxShadow: '5px 5px 5px',
                padding: '20px',
                borderRadius: '5px',
              }}
              gap={20}
            >
              <Flex direction='column' center='both' gap={10}>
                Change Username
                <Input
                  autoFocus
                  placeholder={socketId}
                  value={editUsernameValue}
                  onChange={(event: any) => {
                    setEditUsernameValue(event.target.value);
                  }}
                  onKeyDown={(event: any) => {
                    if (event.key === 'Enter' && editUsernameValue.length > 0) {
                      socket.emit('change username', editUsernameValue);
                      setShowEditUsernameModal(false);
                    }
                  }}
                  style={{
                    width: 200,
                  }}
                />
              </Flex>
              <Flex center='both' gap={10}>
                <Button
                  variant='contained'
                  onClick={() => {
                    setShowEditUsernameModal(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => {
                    socket.emit('change username', editUsernameValue);
                    setShowEditUsernameModal(false);
                  }}
                >
                  Save
                </Button>
              </Flex>
            </Flex>
          </div>
        </Flex>
      )}

      {/* header  */}
      <Flex
        style={{
          position: 'absolute',
          justifyContent: 'space-between',
          left: 20,
          right: 20,
          top: 20,
        }}
      >
        <div>You are {socketId}</div>
        {/* <div>hi</div> */}
        <Flex center='secondary' direction='column' gap={10}>
          <div style={{ fontSize: 36, fontWeight: 'bold' }}>Leaderboards</div>
          <table
            style={{
              borderCollapse: 'collapse',
              textAlign: 'center',
            }}
          >
            <tr>
              {STATE === 'WAIT' && <th>Previous Answers</th>}
              <th>Username</th>
              <th>Score</th>
            </tr>
            {leaderboards.map((entry, index) => {
              const readyString =
                STATE === 'WAIT' ? (entry.ready ? '(Ready)' : '(Not Ready)') : null;
              const editUsernameString = STATE === 'WAIT' && entry.id === socketId ? '✎' : null;
              return (
                <tr>
                  {STATE === 'WAIT' && <td>{entry.prevWriting}</td>}
                  <td
                    style={{ color: prev?.prevWinner === entry.id ? 'green' : 'unset' }}
                    onClick={() => {
                      if (entry.id === socketId && STATE === 'WAIT') {
                        setShowEditUsernameModal(true);
                      }
                    }}
                  >
                    {editUsernameString} {entry.username} ({entry.id}) {readyString}
                  </td>
                  <td>{entry.score}</td>
                </tr>
              );
            })}
          </table>
        </Flex>
      </Flex>

      {/* input area  */}
      <Flex center='both' gap={100} direction='column' style={{ width: '100%', height: '100%' }}>
        {STATE === 'PLAY' ? (
          <Flex direction='column' gap={8}>
            <div style={{ fontSize: 36, fontWeight: 'bold' }}>{question.join(' ')}</div>
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
