import React, { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Toolbar, Tooltip, Typography } from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { visuallyHidden } from '@mui/utils';

import api from '../config/apisauce';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'title', numeric: false, disablePadding: false, label: 'Title', },
  { id: 'author', numeric: false, disablePadding: false, label: 'Author', },
  { id: 'price', numeric: false, disablePadding: false, label: 'Price', },
  { id: 'stock', numeric: false, disablePadding: false, label: 'Stock', },
  { id: 'actions', numeric: false, disablePadding: false, label: 'Actions', },
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all books',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              <Typography variant="h6">{headCell.label}</Typography>
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const EnhancedTableToolbar = (props) => {
  const { numSelected, setAddUpdateBookDialog, setDeleteBookDialog } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          <Button variant="contained" onClick={() => setAddUpdateBookDialog(true)}>Add book</Button>
        </Typography>
      )}

      {numSelected > 0 && (
        <Tooltip title="Delete">
          <IconButton onClick={() => setDeleteBookDialog(true)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const Dashboard = () => {
  const theme = useTheme();

  const [ books, setBooks ] = useState([]);
  const [ addUpdateBookDialog, setAddUpdateBookDialog ] = useState(false);
  const [ bookId, setBookId ] = useState(undefined);
  const [ title, setTitle ] = useState('');
  const [ author, setAuthor ] = useState('');
  const [ price, setPrice ] = useState(0);
  const [ stock, setStock ] = useState(0);
  const [ error, setError ] = useState(null);
  const [ deleteBookDialog, setDeleteBookDialog ] = useState(false);
  const [ toDeleteBook, setToDeleteBook ] = useState(undefined);
  const [ viewBook, setViewBook ] = useState(false);

  const [order, setOrder] =useState('asc');
  const [orderBy, setOrderBy] =useState('calories');
  const [selected, setSelected] =useState([]);
  const [page, setPage] =useState(0);
  const [dense, setDense] =useState(false);
  const [rowsPerPage, setRowsPerPage] =useState(10);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = books.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - books.length) : 0;

  const saveBook = async () => {
    if (!title || !author || price === '' || stock === '') {
      setError('This field is required.');
    } else {
      if (isNaN(price) || isNaN(stock)) {
        setError('This field is required.');
      } else {
        const data = {
          title: title, author: author, price: price, stock: stock
        };

        if (bookId) {
          data.id = bookId;
        }
        
        const result = await api.post('/api/books/save', { data: data });

        if (result.ok) {
          fetchBooks();
          closeAddUpdateBookDialog();
        }
      }
    }
  };

  const editBook = (data) => {
    setAddUpdateBookDialog(true);
    setBookId(data.id);
    setTitle(data.title);
    setAuthor(data.author);
    setPrice(data.price);
    setStock(data.stock);
  };

  const deleteBook = async () => {
    const params = {};

    if (selected.length > 0) {
      params.multi = true;
      params.data = selected;
    } else {
      params.multi = false;
      params.data = toDeleteBook;
    }

    const result = await api.post('/api/books/delete', params);

    if (result.ok) {
      setSelected([]);
      fetchBooks();
      setDeleteBookDialog(false);
    }
  };
  
  const closeAddUpdateBookDialog = () => {
    setBookId(undefined);
    setTitle('');
    setAuthor('');
    setPrice(0);
    setStock(0);
    setError(null);
    setViewBook(false);
    setAddUpdateBookDialog(false);
  };
  
  const fetchBooks = async () => {
    const result = await api.get('/api/books/fetch/all');

    if (result.ok) {
      setBooks(result.data);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);
  
  return (
    <Container maxWidth="lg">
      <Grid container justifyContent="center" spacing={1}>
        <Grid item container xs={12} marginTop={4}>
          <Typography component="h1" variant="h4">Books</Typography>
          <Box sx={{ marginLeft: 'auto' }}>
            <FormControlLabel
              control={<Switch checked={dense} onChange={handleChangeDense} />}
              label="Dense"
            />
          </Box>
        </Grid>
        
        <Grid item container xs={12}>
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2, p: 1 }}>
              <EnhancedTableToolbar numSelected={selected.length} setAddUpdateBookDialog={setAddUpdateBookDialog} setDeleteBookDialog={setDeleteBookDialog} />
              <TableContainer>
                <Table
                  sx={{ minWidth: 750 }}
                  aria-labelledby="tableTitle"
                  size={dense ? 'small' : 'medium'}
                >
                  <EnhancedTableHead
                    numSelected={selected.length}
                    order={order}
                    orderBy={orderBy}
                    onSelectAllClick={handleSelectAllClick}
                    onRequestSort={handleRequestSort}
                    rowCount={books.length}
                  />
                  <TableBody>
                    {stableSort(books, getComparator(order, orderBy))
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => {
                        const isItemSelected = isSelected(row.id);
                        const labelId = `enhanced-table-checkbox-${index}`;

                        return (
                          <TableRow
                            hover
                            // onClick={(event) => handleClick(event, row.title)}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={row.title}
                            selected={isItemSelected}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={isItemSelected}
                                inputProps={{
                                  'aria-labelledby': labelId,
                                }}
                                onChange={(event) => handleClick(event, row.id)}
                              />
                            </TableCell>
                            <TableCell
                              component="th"
                              id={labelId}
                              scope="row"
                              align="left"
                              padding="normal"
                            >
                              {row.title}
                            </TableCell>
                            <TableCell align="left" padding="normal">{row.author}</TableCell>
                            <TableCell align="left" padding="normal">{row.price}</TableCell>
                            <TableCell align="left" padding="normal">{row.stock}</TableCell>
                            <TableCell align="left" padding="none">
                              {
                                selected.length === 0 && (
                                  <Box>
                                    <Tooltip title="View">
                                      <IconButton size="small" onClick={() => { setViewBook(true); editBook(row); }} sx={{ m: 0.5 }}>
                                        <SearchIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Update">
                                      <IconButton size="small" onClick={() => editBook(row)} sx={{ m: 0.5 }}>
                                        <EditIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton size="small" onClick={() => { setToDeleteBook(row); setDeleteBookDialog(true); }} sx={{ m: 0.5 }}>
                                        <DeleteIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                )
                              }
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {emptyRows > 0 && (
                      <TableRow
                        style={{
                          height: (dense ? 33 : 53) * emptyRows,
                        }}
                      >
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={books.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Box>
        </Grid>

        <Dialog
          fullWidth
          maxWidth="sm"
          open={addUpdateBookDialog}
          onClose={closeAddUpdateBookDialog}
        >
          <DialogTitle sx={{ margin: 0, padding: theme.spacing(2) }}>
            {bookId ? (viewBook ? 'Book details' : 'Update book') : 'Add book'}
            <IconButton onClick={closeAddUpdateBookDialog} sx={{ right: theme.spacing(1), top: theme.spacing(1) }} style={{ position: 'absolute', color: theme.palette.grey[500] }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Title"
                  value={title}
                  error={!title && error !== null}
                  onChange={event => setTitle(event.target.value)}
                  disabled={viewBook}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Author"
                  value={author}
                  error={!author && error !== null}
                  onChange={event => setAuthor(event.target.value)}
                  disabled={viewBook}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required error={(price === '' || isNaN(price)) && error !== null} disabled={viewBook}>
                  <InputLabel>Price</InputLabel>
                  <OutlinedInput label="Price" value={price} onChange={event => setPrice(event.target.value)} startAdornment={<InputAdornment position="start">$</InputAdornment>} />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  label="Stock"
                  value={stock}
                  error={(stock === '' || isNaN(stock)) && error !== null}
                  onChange={event => setStock(event.target.value)}
                  disabled={viewBook}
                />
              </Grid>
            </Grid>
          </DialogContent>

          {
            !viewBook &&
            <DialogActions>
              <Button variant="outlined" onClick={closeAddUpdateBookDialog}>Cancel</Button>
              <Button variant="contained" onClick={saveBook}>{bookId ? 'Update' : 'Add'}</Button>
            </DialogActions>
          }
        </Dialog>

        <Dialog open={deleteBookDialog} onClose={() => setDeleteBookDialog(false)}>
          <DialogTitle>Delete {selected.length > 0 ? `${selected.length} book(s)` : `"${toDeleteBook?.title}"`}?</DialogTitle>
          <DialogContent>
            <DialogContentText>This will delete permanently and can not be undone.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteBookDialog(false)}>Cancel</Button>
            <Button autoFocus onClick={deleteBook}>Ok</Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Container>
  );
};

export default Dashboard;