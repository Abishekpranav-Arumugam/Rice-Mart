// src/components/PopulateStock.js
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { productsData } from '../data/productsData'; // Import the shared product data
import { useAuth } from '../context/AuthContext'; // To get the auth token

const PopulateStock = () => {
  const [selectedRiceName, setSelectedRiceName] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { user } = useAuth(); // For getting the Firebase ID token

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' }); // Clear previous messages

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
      const idToken = await user.getIdToken(); // Get Firebase ID token
      const response = await fetch('http://localhost:5000/api/stocks/populate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, // Include token for backend auth (if implemented)
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
    <Container className="mt-5 pt-5"> {/* Added pt-5 for spacing below navbar */}
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg">
            <Card.Header as="h3" className="text-center bg-primary text-white">
              Populate Rice Stock
            </Card.Header>
            <Card.Body>
              {message.text && (
                <Alert variant={message.type === 'success' ? 'success' : 'danger'}>
                  {message.text}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="riceSelect">
                  <Form.Label>Select Rice Variety</Form.Label>
                  <Form.Select
                    aria-label="Select rice variety"
                    value={selectedRiceName}
                    onChange={(e) => setSelectedRiceName(e.target.value)}
                    required
                  >
                    <option value="">-- Select Rice --</option>
                    {productsData.map((rice) => (
                      <option key={rice.id} value={rice.name}>
                        {rice.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

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
                  <Button variant="success" type="submit" disabled={isLoading}>
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