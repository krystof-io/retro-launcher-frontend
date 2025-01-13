import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Badge, Alert } from 'react-bootstrap';
import { Edit2, Save, X, AlertTriangle } from 'lucide-react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { fetchProgramById, searchAuthors, fetchPlatforms} from '../services/api';
import LaunchConfiguration from './LaunchConfiguration';
import ProgramDiskInfo from './ProgramDiskInfo';
import PlaybackTimeline from './PlaybackTimeline';
import { useProgramUpdate } from '../hooks/useProgramUpdate';
import 'react-bootstrap-typeahead/css/Typeahead.css';

const ProgramDetail = () => {
    const { id } = useParams();
    const [program, setProgram] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authorOptions, setAuthorOptions] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [selectedPlatform, setSelectedPlatform] = useState(null);

    const {
        isLoading: isUpdating,
        error: updateError,
        updateProgram,
        validateUpdates
    } = useProgramUpdate(program);

    // Fetch program data
    useEffect(() => {

        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                const [programData, platformsData] = await Promise.all([
                    fetchProgramById(id),
                    fetchPlatforms()
                ]);
                setPlatforms(platformsData);
                setProgram(programData);
                setEditedData(programData);
                setSelectedPlatform(platformsData.find(p => p.id === programData.platform.id));
            } catch (err) {
                setError('Failed to load program details');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();

    }, [id]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    // Add platform change handler
    const handlePlatformChange = (platformId) => {
        const platform = platforms.find(p => p.id === Number(platformId));
        setSelectedPlatform(platform);

        // Update editedData with new platform and reset binary
        handleChange('platform', platform);
        handleChange('platformBinary', null);
    };

    // Add binary change handler
    const handleBinaryChange = (binaryId) => {
        const binary = selectedPlatform?.binaries?.find(b => b.id === Number(binaryId));
        handleChange('platformBinary', binary);
    };

    const handleCancel = () => {
        setEditedData(program);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            const validationErrors = validateUpdates(editedData);
            if (validationErrors) {
                setError('Please correct the following errors: ' +
                    Object.values(validationErrors).join(', '));
                return;
            }

            const updatedProgram = await updateProgram(id, editedData);
            setProgram(updatedProgram);
            setEditedData(updatedProgram);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError('Failed to save changes: ' + err.message);
        }
    };

    const handleChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAuthorSearch = async (query) => {
        try {
            const authors = await searchAuthors(query);
            setAuthorOptions(authors);
        } catch (error) {
            console.error('Error searching authors:', error);
            setAuthorOptions([]);
        }
    };

    const handleAuthorChange = (selectedAuthors) => {
        // Get the newly selected author (last in array if adding)
        const newAuthor = selectedAuthors[0];

        if (!newAuthor) return;

        // Create a new Set of author IDs for easy lookup
        const existingAuthorIds = new Set(editedData.authors.map(a => a.id));

        // Only add if author isn't already in the list
        if (!existingAuthorIds.has(newAuthor.id)) {
            const updatedAuthors = [...editedData.authors, newAuthor];
            handleChange('authors', updatedAuthors);
        }
    };

    const handleRemoveAuthor = (authorId) => {
        if (!isEditing) return;

        const updatedAuthors = editedData.authors.filter(a => a.id !== authorId);
        handleChange('authors', updatedAuthors);
    };

    if (isLoading) {
        return (
            <Card className="mt-3">
                <Card.Body>Loading...</Card.Body>
            </Card>
        );
    }
    const handleUpdateDiskImages = (updatedDisks) => {
        setEditedData(prev => ({
            ...prev,
            diskImages: updatedDisks
        }));
    };

    // Show any errors that occurred during update
    const displayError = error || updateError;


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
                                disabled={isUpdating}
                            >
                                <Save size={16} className="me-2" />
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                variant="outline-secondary"
                                onClick={handleCancel}
                                disabled={isUpdating}
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

            {displayError && (
                <Alert variant="danger" className="mb-4">
                    <AlertTriangle size={20} className="me-2" />
                    {displayError}
                </Alert>
            )}

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
                                {editedData?.authors?.map(author => (
                                    <Badge
                                        key={author.id}
                                        bg="primary"
                                        className="me-2 mb-2"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {author.name}
                                        {isEditing && (
                                            <X
                                                size={14}
                                                className="ms-2 cursor-pointer"
                                                style={{cursor: 'pointer'}}
                                                onClick={() => handleRemoveAuthor(author.id)}
                                            />
                                        )}
                                    </Badge>
                                ))}
                                {!editedData?.authors?.length && (
                                    <span className="text-muted">No authors listed</span>
                                )}
                            </div>
                            {isEditing && (
                                <AsyncTypeahead
                                    id="author-search"
                                    labelKey={(author) => author.name}
                                    minLength={2}
                                    onSearch={handleAuthorSearch}
                                    onChange={handleAuthorChange}
                                    options={authorOptions}
                                    placeholder="Add more authors..."
                                    selected={[]}
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
                    <PlaybackTimeline
                        program={editedData}
                        isEditing={isEditing}
                        onUpdateEvents={(events) => {
                            handleChange('playbackTimelineEvents', events);
                        }}
                    />
                </Col>
            </Row>

            <Row className="mb-4">
                {isEditing && (
                    <Col md={4}>

                        <Form.Group className="mb-3">
                            <Form.Label>Platform</Form.Label>

                            <Form.Select
                                value={editedData?.platform?.id || ''}
                                onChange={(e) => handlePlatformChange(e.target.value)}
                            >
                                <option value="">Select Platform</option>
                                {platforms.map(platform => (
                                    <option key={platform.id} value={platform.id}>
                                        {platform.name}
                                    </option>
                                ))}
                            </Form.Select>

                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Platform Binary</Form.Label>

                                <Form.Select
                                    value={editedData?.platformBinary?.id || ''}
                                    onChange={(e) => handleBinaryChange(e.target.value)}
                                    disabled={!selectedPlatform}
                                >
                                    <option value="">Select Binary</option>
                                    {selectedPlatform?.binaries?.map(binary => (
                                        <option key={binary.id} value={binary.id}>
                                            {binary.name} ({binary.variant})
                                            {binary.isDefault && ' - Default'}
                                        </option>
                                    ))}
                                </Form.Select>

                        </Form.Group>

                        {editedData?.platformBinary?.description && (
                            <Alert variant="info" className="mt-2">
                                <small>{editedData.platformBinary.description}</small>
                            </Alert>
                        )}
                    </Col>

                        )}

                <Col>
                    {/* Launch Configuration */}
                    <LaunchConfiguration
                        program={editedData}
                        isEditing={isEditing}
                        onUpdateLaunchArgs={(args) => {
                            handleChange('launchArguments', args);
                        }}
                    />
                </Col>

            </Row>

            <Row className="mb-4">
                <Col>
                    {/* Disk Information */}
                    <ProgramDiskInfo
                        program={editedData}
                        isEditing={isEditing}
                        onUpdateDiskImages={handleUpdateDiskImages}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default ProgramDetail;