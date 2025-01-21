import React from 'react';

const CuratorNotes = ({ program, editedData, setEditedData, isEditing }) => {
    const handleChange = (e) => {
        const value = e.target.value;
        setEditedData({
            ...editedData,
            curatorNotes: value || null
        });
    };

    return (
        <div className="card mt-4">
            <div className="card-header">
                <h5 className="card-title mb-0">Curator Notes</h5>
            </div>
            <div className="card-body">
                {isEditing ? (
                    <textarea
                        className="form-control"
                        value={editedData.curatorNotes || ''}
                        onChange={handleChange}
                        placeholder="Add curator notes here..."
                        rows={4}
                    />
                ) : (
                    <div>
                        {editedData.curatorNotes || "No curator notes added yet."}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CuratorNotes;