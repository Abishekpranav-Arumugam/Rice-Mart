// src/components/PopulateStock.js
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
// REMOVE: import { productsData } from '../data/productsData';
import { useAuth } from '../context/AuthContext';

const PopulateStock = () => {
  const [selectedRiceName, setSelectedRiceName] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [message, setMessage] = useState({ type: '', text: '' }); // Replaced by toast for success/error
  
  const [availableRiceVarieties, setAvailableRiceVarieties] = useState([]);
  const [isLoadingVarieties, setIsLoadingVarieties] = useState(true);

  const { user } = useAuth();

  // Fetch rice varieties for the dropdown
  useEffect(() => {
    const fetchVarieties = async () => {
      setIsLoadingVarieties(true);
      try {
        const response = await fetch('https://rice-mart.onrender.com/api/riceproducts');
        if (!response.ok) throw new Error('Failed to fetch rice varieties');
        const data = await response.json();
        setAvailableRiceVarieties(data.map(p => ({ id: p._id, name: p.name }))); // Store id and name
      } catch (error) {
        console.error('Error fetching rice varieties for stock population:', error);
        toast.error('Could not load rice varieties.');
        setAvailableRiceVarieties([]); // Ensure it's an array on error
      } finally {
        setIsLoadingVarieties(false);
      }
    };
    fetchVarieties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setMessage({ type: '', text: '' }); // Clear previous messages // Replaced by toast

    if (!selectedRiceName) {
      toast.error('Please select a rice variety.');
      return;
    }
    const quantity = parseInt(quantityToAdd, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity greater than 0.');
      return;
    }

    setIsLoading(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('https://rice-mart.onrender.com/api/stocks/populate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name: selectedRiceName,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to populate stock.');
      }

      toast.success(data.message || `Successfully populated ${quantity} kg of ${selectedRiceName}.`);
      setSelectedRiceName('');
      setQuantityToAdd('');
    } catch (error) {
      console.error('Error populating stock:', error);
      toast.error(error.message || 'An error occurred while populating stock.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-5 pt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg">
            <Card.Header as="h3" className="text-center bg-primary text-white">
              Populate Rice Stock
            </Card.Header>
            <Card.Body>
              {/* {message.text && ( Removed message state for Alert ) } */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="riceSelect">
                  <Form.Label>Select Rice Variety</Form.Label>
                  <Form.Select
                    aria-label="Select rice variety"
                    value={selectedRiceName}
                    onChange={(e) => setSelectedRiceName(e.target.value)}
                    required
                    disabled={isLoadingVarieties || availableRiceVarieties.length === 0}
                  >
                    <option value="">
                      {isLoadingVarieties ? "Loading varieties..." : availableRiceVarieties.length === 0 ? "No varieties available" : "-- Select Rice --"}
                    </option>
                    {availableRiceVarieties.map((rice) => (
                      <option key={rice.id} value={rice.name}>
                        {rice.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* ... rest of the form (quantity, button) ... */}
                <Form.Group className="mb-4" controlId="quantityInput">
                  <Form.Label>Quantity to Add (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter quantity in kg"
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(e.target.value)}
                    required
                    min="1"
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="success" type="submit" disabled={isLoading || isLoadingVarieties}>
                    {isLoading ? 'Populating...' : 'Populate Stock'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PopulateStock;