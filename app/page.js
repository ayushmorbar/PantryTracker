'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, Snackbar, IconButton, Tooltip, Link, Pagination, InputAdornment } from '@mui/material'
import { Add as AddIcon, Remove as RemoveIcon, Close as CloseIcon, Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon, SortByAlpha as SortByAlphaIcon, FilterList as FilterListIcon, SaveAlt as SaveAltIcon, AddCircleOutline as AddCircleOutlineIcon, Search as SearchIcon, Edit as EditIcon } from '@mui/icons-material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

// Modal style for adding new items
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'var(--modal-bg-light)',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  // State variables
  const [inventory, setInventory] = useState([]) // Inventory data
  const [open, setOpen] = useState(false) // Modal open state
  const [itemName, setItemName] = useState('') // New item name
  const [itemQuantity, setItemQuantity] = useState('') // New item quantity
  const [loading, setLoading] = useState(false) // Loading state
  const [error, setError] = useState(null) // Error state
  const [darkMode, setDarkMode] = useState(true) // Dark mode state
  const [snackbarOpen, setSnackbarOpen] = useState(false) // Snackbar open state
  const [snackbarMessage, setSnackbarMessage] = useState('') // Snackbar message

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch inventory data from Firestore
  const updateInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      const snapshot = query(collection(firestore, 'inventory'))
      const docs = await getDocs(snapshot)
      const inventoryList = []
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() })
      })
      setInventory(inventoryList)
    } catch (err) {
      setError('Failed to fetch inventory')
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch inventory data on component mount
  useEffect(() => {
    updateInventory()
  }, [])

  // Toggle dark mode
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode)
  }, [darkMode])

  // Add a new item to the inventory
  const addItem = async (item, quantity) => {
    setLoading(true)
    setError(null)
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      const quantityToAdd = quantity ? parseInt(quantity, 10) : 1
      if (docSnap.exists()) {
        const { quantity: existingQuantity } = docSnap.data()
        await setDoc(docRef, { quantity: existingQuantity + quantityToAdd })
      } else {
        await setDoc(docRef, { quantity: quantityToAdd })
      }
      await updateInventory()
      setSnackbarMessage('Item added successfully')
      setSnackbarOpen(true)
    } catch (err) {
      setError('Failed to add item')
      setSnackbarMessage('Failed to add item')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }
  
  // Remove an item from the inventory
  const removeItem = async (item) => {
    setLoading(true)
    setError(null)
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        if (quantity === 1) {
          await deleteDoc(docRef)
        } else {
          await setDoc(docRef, { quantity: quantity - 1 })
        }
      }
      await updateInventory()
      setSnackbarMessage('Item removed successfully')
      setSnackbarOpen(true)
    } catch (err) {
      setError('Failed to remove item')
      setSnackbarMessage('Failed to remove item')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('')

  // Sorting functionality
  const [sortOrder, setSortOrder] = useState({ field: 'name', direction: 'asc' })

  
  // Edit item functionality
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editName, setEditName] = useState('')
  const [editQuantity, setEditQuantity] = useState('')
    
  const handleEditOpen = (item) => {
    setEditItem(item)
    setEditName(item.name)
    setEditQuantity(item.quantity)
    setEditOpen(true)
  }
  
  const handleEditClose = () => {
    setEditOpen(false)
    setEditItem(null)
    setEditName('')
    setEditQuantity('')
  }
  
  const updateItem = async (item, newName, newQuantity) => {
    setLoading(true)
    setError(null)
    try {
      const docRef = doc(collection(firestore, 'inventory'), item.name)
      const newDocRef = doc(collection(firestore, 'inventory'), newName)
      const quantityToUpdate = newQuantity ? parseInt(newQuantity, 10) : 1
      if (item.name !== newName) {
        await deleteDoc(docRef)
      }
      await setDoc(newDocRef, { quantity: quantityToUpdate })
      await updateInventory()
      setSnackbarMessage('Item updated successfully')
      setSnackbarOpen(true)
    } catch (err) {
      setError('Failed to update item')
      setSnackbarMessage('Failed to update item')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
      handleEditClose()
    }
  }


  // Open the modal
  const handleOpen = () => setOpen(true)

  // Close the modal
  const handleClose = () => {
    setOpen(false)
    setItemName('')
    setItemQuantity('')
  }

  // Close the snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  // Calculate the items to display based on the current page
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = inventory
    .filter(({ name }) => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder.field === 'name') {
        return sortOrder.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else {
        return sortOrder.direction === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity
      }
    })
    .slice(indexOfFirstItem, indexOfLastItem)

  // Convert inventory data to CSV format
  const convertToCSV = (data) => {
    const headers = ['Item Name', 'Quantity']
    const rows = data.map(({ name, quantity }) => [name, quantity])
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n')
    return csvContent
  }

  // Download CSV file
  const downloadCSV = () => {
    const csvContent = convertToCSV(inventory)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'inventory.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={2}
      padding={3}
      bgcolor={darkMode ? 'var(--background-dark)' : 'var(--background-light)'}
    >
      {/* Dark mode toggle button */}
      <Box display="flex" justifyContent="flex-end" width="100%" padding={2} position="absolute" top={0} right={0}>
        <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Inventory Management System
      </Typography>
      <Typography variant="body1" gutterBottom>
        Keep track of your inventory items with ease.
      </Typography>
      {/* Modal for adding new items */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...style, bgcolor: darkMode ? 'var(--modal-bg-dark)' : 'var(--modal-bg-light)' }}>
          <Typography id="modal-modal-title" variant="h6" component="h2" marginBottom={2}>
            Add Item
          </Typography>
          <Stack width="100%" direction="column" spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              id="outlined-quantity"
              label="Quantity (optional)"
              variant="outlined"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName, itemQuantity)
                handleClose()
              }}
              sx={{ bgcolor: 'var(--primary-light)', '&:hover': { bgcolor: 'var(--primary-dark)' } }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      {/* Modal for editing items */}
      <Modal
        open={editOpen}
        onClose={handleEditClose}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box sx={{ ...style, bgcolor: darkMode ? 'var(--modal-bg-dark)' : 'var(--modal-bg-light)' }}>
          <Typography id="edit-modal-title" variant="h6" component="h2" marginBottom={2}>
            Edit Item
          </Typography>
          <Stack width="100%" direction="column" spacing={2}>
            <TextField
              id="edit-item-name"
              label="Item Name"
              variant="outlined"
              fullWidth
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <TextField
              id="edit-item-quantity"
              label="Quantity"
              variant="outlined"
              fullWidth
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => updateItem(editItem, editName, editQuantity)}
              sx={{ bgcolor: 'var(--primary-light)', '&:hover': { bgcolor: 'var(--primary-dark)' } }}
            >
              Update
            </Button>
          </Stack>
        </Box>
      </Modal>
      {/* Buttons for adding new items and exporting to CSV */}
      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          onClick={handleOpen}
          startIcon={<AddCircleOutlineIcon />}
          sx={{ bgcolor: 'var(--primary-light)', '&:hover': { bgcolor: 'var(--primary-dark)' } }}
        >
          Add New Item
        </Button>
        <Button
          variant="contained"
          onClick={downloadCSV}
          startIcon={<SaveAltIcon />}
          sx={{ bgcolor: 'var(--primary-light)', '&:hover': { bgcolor: 'var(--primary-dark)' } }}
        >
          Export to CSV
        </Button>
      </Box>
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      {/* Inventory table */}
      <Card sx={{ width: '80%', borderRadius: 2, boxShadow: 3, bgcolor: darkMode ? 'var(--box-bg-dark)' : 'var(--box-bg-light)' }}>
        <CardContent sx={{ overflow: 'auto', maxHeight: '60vh' }}>
          <TableContainer component={Paper} sx={{ bgcolor: darkMode ? 'var(--box-bg-dark)' : 'var(--box-bg-light)' }}>
            {/* Search and sorting controls */}
            <Box display="flex" alignItems="center" width="100%" marginBottom={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ marginRight: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Tooltip title="Sort by Name">
                <IconButton onClick={() => setSortOrder({ field: 'name', direction: sortOrder.direction === 'asc' ? 'desc' : 'asc' })}>
                  <SortByAlphaIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sort by Quantity">
                <IconButton onClick={() => setSortOrder({ field: 'quantity', direction: sortOrder.direction === 'asc' ? 'desc' : 'asc' })}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: darkMode ? 'var(--text-dark)' : 'var(--text-light)', fontWeight: 'bold' }}>Item Name</TableCell>
                  <TableCell style={{ color: darkMode ? 'var(--text-dark)' : 'var(--text-light)', fontWeight: 'bold' }}>Quantity</TableCell>
                  <TableCell style={{ color: darkMode ? 'var(--text-dark)' : 'var(--text-light)', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map(({ name, quantity }) => (
                  <TableRow key={name} hover>
                    <TableCell style={{ color: darkMode ? 'var(--text-dark)' : 'var(--text-light)' }}>{name.charAt(0).toUpperCase() + name.slice(1)}</TableCell>
                    <TableCell style={{ color: darkMode ? 'var(--text-dark)' : 'var(--text-light)' }}>{quantity}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2}>
                        <Tooltip title="Add">
                          <IconButton
                            onClick={() => addItem(name)}
                            sx={{ borderColor: 'var(--primary-light)', color: 'var(--primary-light)', '&:hover': { borderColor: 'var(--primary-dark)', color: 'var(--primary-dark)' } }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            onClick={() => removeItem(name)}
                            sx={{ borderColor: 'var(--secondary-light)', color: 'var(--secondary-light)', '&:hover': { borderColor: 'var(--secondary-dark)', color: 'var(--secondary-dark)' } }}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEditOpen({ name, quantity })}
                            sx={{ borderColor: 'var(--edit-light)', color: 'var(--edit-light)', '&:hover': { borderColor: 'var(--edit-dark)', color: 'var(--edit-dark)' } }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Pagination controls */}
            <Box display="flex" justifyContent="center" marginTop={2} paddingBottom={2}>
              <Pagination
                count={Math.ceil(inventory.length / itemsPerPage)}
                page={currentPage}
                onChange={(event, value) => setCurrentPage(value)}
                color="primary"
              />
            </Box>
          </TableContainer>
        </CardContent>
      </Card>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
      <Box component="footer" mt={4} textAlign="center">
        <Typography variant="body2" color={darkMode ? 'var(--text-dark)' : 'var(--text-light)'}>
          Made with ❤️ by 
          <Link href="https://www.linkedin.com/in/ayushmorbar/" target="_blank" rel="noopener" color="inherit" sx={{ marginLeft: 1, marginRight: 1 }}>
            Ayush Morbar
          </Link>
          and 
          <Link href="https://www.linkedin.com/company/offbeats/" target="_blank" rel="noopener" color="inherit" sx={{ marginLeft: 1 }}>
            Offbeats Developer Studio
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}