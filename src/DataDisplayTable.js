import React from 'react';

const DataDisplayTable = ({ data }) => {
    if (!data || data.length === 0) {
        return <div>No data to display.</div>;
    }

    const tableHeaders = Object.keys(data[0]);

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        {tableHeaders.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {tableHeaders.map((header, index) => (
                                <td key={index}>{row[header]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataDisplayTable;
