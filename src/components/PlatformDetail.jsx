import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, Save, X, ArrowLeft, Trash2 } from 'lucide-react';
import BinaryDetail from './BinaryDetail';


// PlatformDetail Component
const PlatformDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [platform, setPlatform] = useState({
        name: '',
        description: '',
        binaries: []
    });
    const [isEditing, setIsEditing] = useState(isNew);
    const [isLoading, setIsLoading] = useState(!isNew);
    const [error, setError] = useState(null);
    const [showBinaryForm, setShowBinaryForm] = useState(false);
    const [newBinary, setNewBinary] = useState({
        name: '',
        variant: 'Default',
        description: '',
        isDefault: false,
        launchArguments: []
    });

    useEffect(() => {
        if (!isNew) {
            fetchPlatform();
        }
    }, [id]);

    const fetchPlatform = async () => {
        try {
            const response = await fetch(`/api/platform/${id}`);
            if (!response.ok) throw new Error('Failed to fetch platform');
            const data = await response.json();
            setPlatform(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const url = isNew ? '/api/platforms' : `/api/platform/${id}`;
            const method = isNew ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(platform),
            });

            if (!response.ok) throw new Error('Failed to save platform');
            const savedPlatform = await response.json();
            setPlatform(savedPlatform);
            setIsEditing(false);

            if (isNew) {
                navigate(`/platforms/${savedPlatform.id}`);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddBinary = () => {
        const updatedBinaries = [...platform.binaries, {
            ...newBinary,
            id: Date.now() // Temporary ID until saved
        }];

        // If first binary or marked as default, ensure it's the only default
        if (newBinary.isDefault || updatedBinaries.length === 1) {
            updatedBinaries.forEach(binary => {
                binary.isDefault = binary === updatedBinaries[updatedBinaries.length - 1];
            });
        }

        setPlatform({ ...platform, binaries: updatedBinaries });
        setNewBinary({
            name: '',
            variant: 'Default',
            description: '',
            isDefault: false
        });
        setShowBinaryForm(false);
    };

    if (isLoading) {
        return <Container className="mt-4"><div>Loading platform details...</div></Container>;
    }

    return (
        <Container className="mt-4">
            <Button
                variant="link"
                onClick={() => navigate('/platforms')}
                className="mb-4 d-flex align-items-center gap-2"
            >
                <ArrowLeft size={16} />
                Back to Platforms
            </Button>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0">
                        {isNew ? 'New Platform' : platform.name}
                    </h2>
                    {!isNew && !isEditing && (
                        <Button
                            variant="primary"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Platform
                        </Button>
                    )}
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Platform Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={platform.name}
                                onChange={(e) => setPlatform({ ...platform, name: e.target.value })}
                                disabled={!isEditing}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={platform.description}
                                onChange={(e) => setPlatform({ ...platform, description: e.target.value })}
                                disabled={!isEditing}
                            />
                        </Form.Group>

                        {isEditing && (
                            <div className="d-flex gap-2">
                                <Button
                                    variant="primary"
                                    onClick={handleSave}
                                    className="d-flex align-items-center gap-2"
                                >
                                    <Save size={16} />
                                    Save Platform
                                </Button>
                                {!isNew && (
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setIsEditing(false)}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        )}
                    </Form>
                </Card.Body>
            </Card>

            {/* Platform Binaries Section */}
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Platform Binaries</h3>
                    {isEditing && !showBinaryForm && (
                        <Button
                            variant="primary"
                            onClick={() => setShowBinaryForm(true)}
                            className="d-flex align-items-center gap-2"
                        >
                            <PlusCircle size={16} />
                            Add Binary
                        </Button>
                    )}
                </Card.Header>
                <Card.Body>
                    {/* Binary List using BinaryDetail component */}
                    {platform.binaries?.map(binary => (
                        <BinaryDetail
                            key={binary.id}
                            binary={binary}
                            isEditing={isEditing}
                            onUpdate={(updatedBinary) => {
                                const updatedBinaries = platform.binaries.map(b =>
                                    b.id === updatedBinary.id ? updatedBinary : b
                                );
                                setPlatform({ ...platform, binaries: updatedBinaries });
                            }}
                            onDelete={() => {
                                const updatedBinaries = platform.binaries.filter(b => b.id !== binary.id);
                                setPlatform({ ...platform, binaries: updatedBinaries });
                            }}
                        />
                    ))}

                    {/* New Binary Form */}
                    {showBinaryForm && (
                        <Card className="mt-3 bg-light">
                            <Card.Body>
                                <h4>Add New Binary</h4>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Binary Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={newBinary.name}
                                            onChange={(e) => setNewBinary({ ...newBinary, name: e.target.value })}
                                            placeholder="e.g., x64sc"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Variant</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={newBinary.variant}
                                            onChange={(e) => setNewBinary({ ...newBinary, variant: e.target.value })}
                                            placeholder="e.g., Default, Fast, Accurate"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={newBinary.description}
                                            onChange={(e) => setNewBinary({ ...newBinary, description: e.target.value })}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            label="Set as default binary"
                                            checked={newBinary.isDefault || platform.binaries.length === 0}
                                            onChange={(e) => setNewBinary({ ...newBinary, isDefault: e.target.checked })}
                                            disabled={platform.binaries.length === 0}
                                        />
                                    </Form.Group>

                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="primary"
                                            onClick={handleAddBinary}
                                            disabled={!newBinary.name}
                                        >
                                            Add Binary
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setShowBinaryForm(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

// PlatformList Component
const PlatformList = () => {
    const [platforms, setPlatforms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                const response = await fetch('/api/platforms');
                if (!response.ok) throw new Error('Failed to fetch platforms');
                const data = await response.json();
                setPlatforms(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlatforms();
    }, []);

    if (isLoading) {
        return <Container className="mt-4"><div>Loading platforms...</div></Container>;
    }

    if (error) {
        return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
    }

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Platforms</h1>
                <Button
                    variant="primary"
                    as={Link}
                    to="/platforms/new"
                    className="d-flex align-items-center gap-2"
                >
                    <PlusCircle size={16} />
                    Add Platform
                </Button>
            </div>

            <Row xs={1} md={2} lg={3} className="g-4">
                {platforms.map(platform => (
                    <Col key={platform.id}>
                        <Card className="h-100">
                            <Card.Body>
                                <Card.Title>{platform.name}</Card.Title>
                                <Card.Text>{platform.description}</Card.Text>
                                <div className="mb-3">
                                    <strong>Binaries:</strong>
                                    <ul className="list-unstyled mb-0">
                                        {platform.binaries?.map(binary => (
                                            <li key={binary.id}>
                                                {binary.name} ({binary.variant})
                                                {binary.isDefault && (
                                                    <span className="badge bg-primary ms-2">Default</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Button
                                    variant="outline-primary"
                                    as={Link}
                                    to={`/platforms/${platform.id}`}
                                    className="w-100"
                                >
                                    Manage Platform
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {platforms.length === 0 && (
                <div className="text-center mt-4">
                    <p className="text-muted">No platforms configured yet.</p>
                    <Button
                        variant="primary"
                        as={Link}
                        to="/platforms/new"
                    >
                        Add Your First Platform
                    </Button>
                </div>
            )}
        </Container>
    );
};

export { PlatformList, PlatformDetail };