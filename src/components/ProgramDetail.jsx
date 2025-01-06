import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Badge, Alert } from 'react-bootstrap';
import { Edit2, Save, X, AlertTriangle } from 'lucide-react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { fetchProgramById, searchAuthors, updateProgram } from '../services/api';
import LaunchConfiguration from './LaunchConfiguration';

const ProgramDetail = () => {
    const { id } = useParams();
    const [program, setProgram] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch program data
    useEffect(() => {
        const loadProgram = async () => {
            try {
                setIsLoading(true);
                const data = await fetchProgramById(id);
                setProgram(data);
                setEditedData(data);
            } catch (err) {
                setError('Failed to load program details');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadProgram();
    }, [id]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedData(program);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const updatedProgram = await updateProgram(id, editedData);
            setProgram(updatedProgram);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to save changes');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (isLoading) {
        return (
            <Card className="mt-3">
                <Card.Body>Loading...</Card.Body>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="mt-3">
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
            </Alert>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>{program.title}</h1>
                <div>
                    {isEditing ? (
                        <div className="d-flex gap-2">
                            <Button
                                variant="success"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                <Save size={16} className="me-2" />
                                Save Changes
                            </Button>
                            <Button
                                variant="outline-secondary"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                <X size={16} className="me-2" />
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <Button variant="primary" onClick={handleEdit}>
                            <Edit2 size={16} className="me-2" />
                            Edit Details
                        </Button>
                    )}
                </div>
            </div>

            <Row className="mb-4">
                <Col md={8}>
                    {/* Basic Information */}
                    <Card className="h-100">
                        <Card.Header>
                            <h5 className="mb-0">Basic Information</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={editedData?.title || ''}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={editedData?.description || ''}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Release Year</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={editedData?.releaseYear || ''}
                                            onChange={(e) => handleChange('releaseYear', e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Platform</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={editedData?.platform?.name || ''}
                                            disabled={true}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    {/* Author Information */}
                    <Card className="h-100">
                        <Card.Header>
                            <h5 className="mb-0">Authors</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                {program?.authors?.map(author => (
                                    <Badge
                                        key={author.id}
                                        bg="secondary"
                                        className="me-2 mb-2"
                                    >
                                        {author.name}
                                    </Badge>
                                )) || 'No authors listed'}
                            </div>
                            {isEditing && (
                                <AsyncTypeahead
                                    id="author-search"
                                    labelKey="name"
                                    minLength={2}
                                    onSearch={searchAuthors}
                                    placeholder="Add more authors..."
                                    renderMenuItemChildren={(author) => (
                                        <div>
                                            <span>{author.name}</span>
                                            {author.description && (
                                                <small className="d-block text-muted">
                                                    {author.description}
                                                </small>
                                            )}
                                        </div>
                                    )}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    {/* Status Information */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Status</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Content Rating</Form.Label>
                                        <Form.Select
                                            value={editedData?.contentRating || ''}
                                            onChange={(e) => handleChange('contentRating', e.target.value)}
                                            disabled={!isEditing}
                                        >
                                            <option value="UNRATED">Unrated</option>
                                            <option value="SAFE">Safe</option>
                                            <option value="NSFW">NSFW</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Curation Status</Form.Label>
                                        <Form.Select
                                            value={editedData?.curationStatus || ''}
                                            onChange={(e) => handleChange('curationStatus', e.target.value)}
                                            disabled={!isEditing}
                                        >
                                            <option value="UNCURATED">Uncurated</option>
                                            <option value="WORKING">Working</option>
                                            <option value="BROKEN">Broken</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {editedData?.curationStatus === 'BROKEN' && (
                                <Alert variant="warning" className="d-flex align-items-center gap-2">
                                    <AlertTriangle size={20} />
                                    This program has been marked as broken
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    {/* Run Statistics */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Statistics</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col>
                                    <div className="mb-2">
                                        <strong>Total Runs:</strong> {program?.runCount || 0}
                                    </div>
                                    {program?.lastRunAt && (
                                        <div>
                                            <strong>Last Run:</strong>{' '}
                                            {new Date(program.lastRunAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    {/* Launch Configuration */}
                    <LaunchConfiguration
                        program={program}
                        isEditing={isEditing}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default ProgramDetail;