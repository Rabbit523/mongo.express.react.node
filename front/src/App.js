import React, { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
// Import React Table
import ReactTable from "react-table"
import "react-table/react-table.css"
// Import React Datepicker
import DateFnsUtils from '@date-io/date-fns'
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
// Import material-ui button
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { purple } from '@material-ui/core/colors';
// Import TodoForm, TodoList
import TodoForm from './todo'
import TodoList from './todoList'
// Import React Modal dialog
import Modal from 'react-modal'
// Import React Spinner
import { css } from "@emotion/core";
import { FadeLoader } from "react-spinners";
// Get Data, Capture Data
import { uploadData, fetchData, uploadSymbol } from "./utils"
// Define Global variables for datepicker and input
var g_selected_date = {}
var g_increases = {}
// Define modal dialog style
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width                 : 400,
    height                : 500,
  }
};
// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;
// Define Custom Button styles
const ColorButton = withStyles(theme => ({
  root: {
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: purple[500],
    '&:hover': {
      backgroundColor: purple[700],
    },
  },
}))(Button);

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  },
}));

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root')

function App() {
  const classes = useStyles();
  const [clickCount, setclickCount] = useState(0)
  const [isModal, setisModal] = useState(false)
  const [isTodo, setTodo] = useState(true)
  const [loading, setLoading] = useState(false)
  const [selected_date, setSelectedDate] = useState({})
  
  const [date, setDate] = useState(new Date('2019-01-01'))

  const [increases, setIncrease] = useState({})
  const [data, setData] = useState()
  const [url, setUrl] = useState('')
  const [symbols, setSymbols] = useState([])
  const [multiSymbols, setMultiSymbols] = useState('');
  const [columns, setColumns] = useState([
    {
      Header: 'Symbol',
      accessor: 'symbol',
      Cell: ({ row }) => <p>{row.symbol}</p>,
      filterMethod: (filter, row) => {
        return row[filter.id] && row[filter.id].startsWith(filter.value);
      },
      Filter: ({filter, onChange}) => (
        <input type='text' placeholder="Symbol" value={filter ? filter.value : ''} onChange={event => onChange(event.target.value)}/>
      )
    },
    {
      Header: 'date1',
      accessor: 'time_o_1',
      Cell: ({ row }) => <p>{row.time_o_1}</p>,
      Filter: ({ filter, onChange}) => (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DateTimePicker value={g_selected_date.time_o_1} onChange={event => onChangeDate(event, 'time_o_1')} />
        </MuiPickersUtilsProvider>
      )
    },
    {
      Header: 'date2',
      accessor: 'time_o_2',
      Cell: ({ row }) => <p>{row.time_o_2}</p>,
      Filter: ({ filter, onChange}) => (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DateTimePicker value={g_selected_date.time_o_2} onChange={event => onChangeDate(event, 'time_o_2')} />
        </MuiPickersUtilsProvider>
      )
    },
    {
      Header: 'increase1',
      accessor: 'increase1',
      Cell: ({ row }) => <p>{row.increase1 ? row.increase1 : 0 }%</p>,
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            color: rowInfo && rowInfo.row.increase1 > 0 ? 'green' : 'red',
          },
        };
      },
      filterMethod: () => {},
      Filter: () => (
        <input type='text' placeholder="Increase 1-2" value={increases.increase1} onChange={event => onChangeIncrease(event.target.value, 'increase1')} />
      )
    },
  ])
  
  const onChangeDate = (date, type) => {
    var temp = Object.assign({}, g_selected_date)
    temp[type] = date;
    setSelectedDate(temp)
    g_selected_date = temp
  };

  const onChangeIncrease = (value, type) => {
    var temp = Object.assign({}, g_increases)
    temp[type] = value;
    setIncrease(temp)
    g_increases = temp
  };

  const updateMyData = (rowIndex, columnId, value) => {
    setData(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          }
        }
        return row
      })
    )
  }

  useEffect(() => {
    if (clickCount !== 0) {
      let date_num = clickCount + 2;
      let increase_num = clickCount + 1;
      const date_pick_name = 'time_o_' + date_num;
      const header_name = 'date' + date_num; 
      const increase_name = 'increase' + increase_num;

      var temp = [...columns];
      temp.push(
        {
          Header: header_name,
          accessor: date_pick_name,
          Cell: ({ row }) => <p>{row[date_pick_name]}</p>,
          Filter: ({ filter, onChange}) => (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker value={selected_date.date_pick_name} onChange={event => onChangeDate(event, date_pick_name)} />
            </MuiPickersUtilsProvider>
          )
        },
        {
          Header: increase_name,
          accessor: increase_name,
          Cell: ({ row }) => <p>{row[increase_name] ? row[increase_name] : 0}%</p>,
          getProps: (state, rowInfo, column) => {
            return {
                style: {
                    color: rowInfo && rowInfo.row[increase_name] > 0 ? 'green' : 'red',
                },
            };
          },
          filterMethod: () => {},
          Filter: () => (
            <input type='text' placeholder="Increase 1-2" value={g_selected_date.increase_name} onChange={event => onChangeIncrease(event.target.value, increase_name)} />
          )
        }
      )
      setColumns(temp);
    }
  }, [clickCount])
  
  const addColumn = () => {
    setclickCount(clickCount + 1)
  }

  const loadSymbols = () => {
    setisModal(true)
  }

  const multipleUpload = () => {
    setTodo(!isTodo)
  }

  const handleSymbolChange = (e) => {
    setMultiSymbols(e.target.value);
  }

  const chunkArray = (myArray, chunk_size) => {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    
    for (index = 0; index < arrayLength; index += chunk_size) {
        let myChunk = myArray.slice(index, index+chunk_size);
        tempArray.push(myChunk);
    }

    return tempArray;
  }

  const captureData = async () => {
    const multiline_items = multiSymbols.split("\n");
      
    try {
      let group = [];
      if (isTodo) { 
        group = chunkArray(symbols, 100);
      } else {
        group = chunkArray(multiline_items, 100);
      }
      
      var index = 0;
      for (index in group) {
        setLoading(true);
        let promises = group[index].map(endpoint => {
          return uploadData({ endpoint: endpoint + "/" + url });
        });
        const results = await Promise.all(promises);
        console.log(results)
      }
      setLoading(false);

    } catch (err) {
      console.error(err);
    }
  }

  const clearURL = () => {
    setUrl('');
  }

  const loadData = () => {
    const multiline_items = multiSymbols.split("\n");
    const params = {
      symbols: isTodo ? symbols : multiline_items,
      increments: increases,
      dates: selected_date
    };
    setLoading(true);
    fetchData(params).then(response => {
      if (response.success) {
        setData(response.data)
        setLoading(false);
      } else {
        console.error(response.data)
      }
    }).catch(console.error);
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      uploadData(url)
      .then(response => {
        if (response.success) {
          console.log('successfully captured');
        }
      })
      .catch(console.error);
    }
  }
  
  const closeModal = (e) => {
    setisModal(false);
  }

  const submitSymbols = (e) => {
    const multiline_items = multiSymbols.split("\n");
    const params = {
      data: multiline_items
    };
    uploadSymbol(params).then(response => {
      if (response.success) {
        console.log('successfully uploaded');
      }
      setisModal(false);
    }).catch(console.error);
  };

  return (
    <div className="App">
      <Modal isOpen={isModal} onRequestClose={closeModal} style={customStyles}>
        <div className="modal-header">
          <IconButton aria-label="delete" onClick={(e) => closeModal(e)}>
            <HighlightOffIcon />
          </IconButton>
        </div>
        <div className="modal-body">
          {isTodo ? (<div>
            <TodoForm
              saveTodo={(todoText) => {
                const trimmedText = todoText.trim();
                if (trimmedText.length > 0) {
                  setSymbols([...symbols, trimmedText]);
                }
              }}
            />
            <TodoList todos={symbols} /> </div>) : 
            (
              <TextField label="Symobols Multiple Uploading" multiline={true} variant="outlined" value={multiSymbols} onChange={handleSymbolChange}/>
            )}
        </div>
        <div className="modal-footer">
          <ColorButton variant="contained" color="secondary" className={classes.button} onClick={(e) => multipleUpload(e)}>{isTodo ? 'Multiple Upload': 'Single Upload' }</ColorButton>
          <ColorButton variant="contained" color="primary" className={classes.button} onClick={(e) => isTodo ? closeModal(e) : submitSymbols(e)}>Submit</ColorButton>
        </div>
      </Modal>
      {loading ? (<div className="sweet-loading">
        <FadeLoader css={override} size={150} color={"#8A2BE2"} loading={loading} />
        <p>Loading...</p>
      </div>) : null }
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="App-header-text">React Table Customization</p>
      </header>
      <div className="App-body">
        <div className="App-btn-group">
          <div className="App-btns">
            <Button variant="contained" color="secondary" className={classes.button} startIcon={<CloudUploadIcon />} onClick={(e) => captureData(e)}>Capture</Button>
            <Button variant="outlined" className={classes.button} onClick={(e) => clearURL(e)}> Clear</Button>
            <Button variant="contained" color="primary" className={classes.button} onClick={(e) => loadData(e)}> Load</Button>
          </div>
          <div className="App-btn">
            <ColorButton variant="contained" color="primary" className={classes.button} onClick={(e) => loadSymbols(e)}>Load Symbols</ColorButton>
          </div>
        </div>
        <div className="App-input-group">
          <input type="text" className="App-input" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={handleKeyDown}/>
          <div className="App-btn">
            <button onClick={addColumn}> Add Column </button>
          </div>
        </div>
        <ReactTable 
          data={data}
          filterable
          defaultFilterMethod={(filter, row) =>
            String(row[filter.id]) === filter.value}
          columns={columns}
          setData={setData}
          updateMyData={updateMyData} 
        />
      </div>
    </div>
  );
}

export default App;
