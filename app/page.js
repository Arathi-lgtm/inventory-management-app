'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, MenuItem, Grid } from '@mui/material';
import { firestore, auth, provider } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { parse } from 'json2csv'; // Correct import for json2csv
import Login from './login';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("User:", currentUser);
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error fetching inventory: ", error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1, category, description, price, supplier });
      } else {
        await setDoc(docRef, { quantity: 1, category, description, price, supplier });
      }
      await updateInventory();
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }
      await updateInventory();
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const exportData = () => {
    const fields = ['name', 'quantity', 'category', 'description', 'price', 'supplier'];
    const opts = { fields };
    try {
      const csv = parse(inventory, opts);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'inventory.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      {user ? (
        <>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Add Item
              </Typography>
              <Stack width="100%" direction={'column'} spacing={2}>
                <TextField
                  id="outlined-basic"
                  label="Item"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <TextField
                  select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Clothing">Clothing</MenuItem>
                  <MenuItem value="Food">Food</MenuItem>
                  {/* Add more categories as needed */}
                </TextField>
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    addItem(itemName);
                    setItemName('');
                    setCategory('');
                    setDescription('');
                    setPrice('');
                    setSupplier('');
                    handleClose();
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>
          <TextField
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
            Add New Item
          </Button>
          <Button onClick={exportData} sx={{ mb: 2 }}>
            Export as CSV
          </Button>
          <Box
            border={'1px solid #333'}
            width="80%"
            maxWidth="800px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            p={2}
            overflow="auto"
          >
            <Box
              width="100%"
              height="50px"
              bgcolor={'#ADD8E6'}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
              mb={2}
            >
              <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
                Inventory Items
              </Typography>
            </Box>
            <Stack width="100%" spacing={2}>
              {currentItems.map(({ name, quantity, category, description, price, supplier }) => (
                <Box
                  key={name}
                  width="100%"
                  display={'flex'}
                  flexDirection="column"
                  bgcolor={'#f0f0f0'}
                  p={2}
                  mb={2}
                >
                  <Typography variant={'h5'} color={'#333'}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant={'body1'} color={'#333'}>
                    Quantity: {quantity}
                  </Typography>
                  <Typography variant={'body1'} color={'#333'}>
                    Category: {category}
                  </Typography>
                  <Typography variant={'body1'} color={'#333'}>
                    Description: {description}
                  </Typography>
                  <Typography variant={'body1'} color={'#333'}>
                    Price: {price}
                  </Typography>
                  <Typography variant={'body1'} color={'#333'}>
                    Supplier: {supplier}
                  </Typography>
                  <Button variant="contained" onClick={() => removeItem(name)} sx={{ mt: 1 }}>
                    Remove
                  </Button>
                </Box>
              ))}
            </Stack>
            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
              <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                Previous
              </Button>
              <Typography variant="body1" style={{ margin: '0 10px' }}>
                Page {currentPage}
              </Typography>
              <Button onClick={() => setCurrentPage(prev => prev + 1)}>
                Next
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        <Login />
      )}
    </Box>
  );
}
