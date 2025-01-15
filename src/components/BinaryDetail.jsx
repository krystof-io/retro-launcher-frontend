import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { PlusCircle, Save, X, Trash2, Settings, ArrowUp, ArrowDown } from 'lucide-react';

const BinaryDetail = ({ binary, isEditing, onUpdate, onDelete }) => {
    const [showArgForm, setShowArgForm] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [newArgument, setNewArgument] = useState({
        argumentOrder: 1,
        argumentTemplate: '',
        isRequired: true,
        fileArgument: false,
        description: ''
    });

    const handleAddArgument = () => {
        const updatedBinary = {
            ...binary,
            launchArguments: [...(binary.launchArguments || []), {
                ...newArgument,
                argumentOrder: binary.launchArguments?.length
                    ? Math.max(...binary.launchArguments.map(arg => arg.argumentOrder)) + 1
                    : 1
            }]
        };
        onUpdate(updatedBinary);
        setNewArgument({
            argumentOrder: 1,
            argumentTemplate: '',
            isRequired: true,
            fileArgument: false,
            description: ''
        });
        setShowArgForm(false);
    };

    const handleDeleteArgument = (argumentToDelete) => {
        const updatedArgs = binary.launchArguments
            .filter(arg => arg !== argumentToDelete)
            .map((arg, index) => ({
                ...arg,
                argumentOrder: index + 1
            }));

        onUpdate({
            ...binary,
            launchArguments: updatedArgs
        });
    };

    const handleMoveArgument = (argument, direction) => {
        const currentIndex = binary.launchArguments.findIndex(arg => arg === argument);
        if ((direction === 'up' && currentIndex === 0) ||
            (direction === 'down' && currentIndex === binary.launchArguments.length - 1)) {
            return;
        }

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const updatedArgs = [...binary.launchArguments];
        [updatedArgs[currentIndex], updatedArgs[newIndex]] = [updatedArgs[newIndex], updatedArgs[currentIndex]];

        // Update order numbers
        updatedArgs.forEach((arg, index) => {
            arg.argumentOrder = index + 1;
        });

        onUpdate({
            ...binary,
            launchArguments: updatedArgs
        });
    };

    return (
        <Card className="mb-3">
            <Card.Header
                className="d-flex justify-content-between align-items-center"
                style={{ cursor: 'pointer' }}
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <h5 className="mb-0">
                        {binary.name}
                        <span className="text-muted ms-2">({binary.variant})</span>
                        {binary.isDefault && (
                            <span className="badge bg-primary ms-2">Default</span>
                        )}
                    </h5>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    {isEditing && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(binary);
                            }}
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                    <Settings
                        size={16}
                        className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </Card.Header>

            {expanded && (
                <Card.Body>
                    <p className="text-muted">{binary.description}</p>

                    {/* Launch Arguments Section */}
                    <div className="mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Launch Arguments</h6>
                            {isEditing && !showArgForm && (
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => setShowArgForm(true)}
                                >
                                    <PlusCircle size={16} className="me-1" />
                                    Add Argument
                                </Button>
                            )}
                        </div>

                        {/* Arguments List */}
                        {binary.launchArguments?.map((arg, index) => (
                            <Card key={index} className="mb-2 bg-light">
                                <Card.Body className="py-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <code>{arg.argumentTemplate}</code>
                                            <span className="text-muted ms-2">({arg.description})</span>
                                            {arg.fileArgument && (
                                                <span className="badge bg-info ms-2">File Argument</span>
                                            )}
                                            {arg.isRequired && (
                                                <span className="badge bg-warning ms-2">Required</span>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <div className="d-flex gap-1">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleMoveArgument(arg, 'up')}
                                                    disabled={index === 0}
                                                >
                                                    <ArrowUp size={14} />
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleMoveArgument(arg, 'down')}
                                                    disabled={index === binary.launchArguments.length - 1}
                                                >
                                                    <ArrowDown size={14} />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteArgument(arg)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}

                        {/* New Argument Form */}
                        {showArgForm && (
                            <Card className="mt-3">
                                <Card.Body>
                                    <h6>Add Launch Argument</h6>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Argument Template</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={newArgument.argumentTemplate}
                                                onChange={(e) => setNewArgument({
                                                    ...newArgument,
                                                    argumentTemplate: e.target.value
                                                })}
                                                placeholder="e.g., -autostart"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={newArgument.description}
                                                onChange={(e) => setNewArgument({
                                                    ...newArgument,
                                                    description: e.target.value
                                                })}
                                                placeholder="Explain what this argument does"
                                            />
                                        </Form.Group>

                                        <div className="mb-3">
                                            <Form.Check
                                                type="checkbox"
                                                label="Is Required"
                                                checked={newArgument.isRequired}
                                                onChange={(e) => setNewArgument({
                                                    ...newArgument,
                                                    isRequired: e.target.checked
                                                })}
                                            />
                                            <Form.Check
                                                type="checkbox"
                                                label="Is File Argument"
                                                checked={newArgument.fileArgument}
                                                onChange={(e) => setNewArgument({
                                                    ...newArgument,
                                                    fileArgument: e.target.checked
                                                })}
                                            />
                                        </div>

                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="primary"
                                                onClick={handleAddArgument}
                                                disabled={!newArgument.argumentTemplate}
                                            >
                                                Add Argument
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setShowArgForm(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        )}
                    </div>
                </Card.Body>
            )}
        </Card>
    );
};

export default BinaryDetail;