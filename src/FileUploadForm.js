import React, { Children, useState } from 'react';
import axios from 'axios';
import DataDisplayTable from './DataDisplayTable';
import { saveAs } from 'file-saver';
const XLSX = require('xlsx');
async function sendDataTurboExternal(full_data, acc_no) {
    try {
        if (full_data.length == 0)
            return;
        let currentEpoch = Date.now().toString();
        let mac = await getMac("9h2f348f-293h49" + currentEpoch);
        if (JSON.parse(full_data).length > 0) {
            return new Promise(function (resolve, reject) {
                var data = full_data;
                data = "data=" + (data) + "&acc_no=" + acc_no;
                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                myHeaders.append("mac", mac);
                myHeaders.append("epochTime", currentEpoch);
                var urlencoded = new URLSearchParams();
                urlencoded.append("data", full_data);
                urlencoded.append("acc_no", acc_no);
                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: urlencoded,
                    redirect: 'follow'
                };
                fetch("https://sub.buyhatke.com/recon-api/uploadReconTransactions", requestOptions)
                    .then(response => {
                        return resolve('ok');
                    })
                    .catch(error => {
                        console.log('error from new api: ', error);
                        return resolve('ok');
                    });
            });
        } else {
            return;
        }
    } catch (ee) {
        console.log("Error in sendDataTurboExternal ", ee);
    }
}

async function getMac(message) {
    try {
        const secretKey = 'lkjlh419#JLK@KLSA';
        const hmac = crypto.createHmac('sha512', secretKey);
        hmac.update(message);
        const mac = hmac.digest('hex');
        return mac;
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}

const FileUploadForm = () => {
    const [file, setFile] = useState(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [CurrYear, setCurrYear] = useState('');
    const [jsonData, setJsonData] = useState([]);
    const [dataUploaded, setDataUploaded] = useState(true);
    const [uploadedData, setUploadedData] = useState([]);
    const [displayData, setDisplayData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendButtonEnabled, setSendButtonEnabled] = useState(false);
    const [error, setError] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [success, setSuccess] = useState('');
    const [reconOrOnRamp, setReconOrOnRamp] = useState(0);
    const [configData, setConfigData] = useState({
        tr_date: '',
        desc: '',
        credit: '',
        ref_no: '',
        debit: '',
        balance: '',
        otp: '',
        upi_id: '',
        isSameColumn: '',
        BankName: '',
        description: '',
        refOutput: '',
        otpOutput: ''
    });

    const configProperties = [
        'BankName',
        'tr_date',
        'desc',
        'credit',
        'ref_no',
        'debit',
        'balance',
        'otp',
        "upi_id",
        'isSameColumn',
        "description",
        "refOutput",
        "otpOutput"
    ];

    const handleFileChange = async (e) => {
        try {
            setDataUploaded(false);
            const uploadedFile = e.target.files[0];
            setFile(e.target.files[0]);
            const data = await readXlsxFile(uploadedFile);
            setUploadedData(data);
        } catch (err) {
            setError(err);
        }
    };

    const readXlsxFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const workbook = XLSX.readFile(event.target.result);
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
                let fileData = [];
                for (let i = 0; i < jsonData.length; i++) {
                    let d = {};
                    for (let j = 0; j < jsonData[i].length; j++) {
                        d[`col` + (j + 1)] = jsonData[i][j];
                    }
                    fileData.push(d);
                }
                resolve(fileData.slice(0, 50));
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const handleClearData = () => {
        setUploadedData([]);
        setDataUploaded(true);
    };

    const handleApproveData = () => {
        setIsSending(false);
        setSendButtonEnabled(true);
    };

    const handleAccountChange = (e) => {
        setAccountNumber(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('accountNumber', accountNumber);
        formData.append('BankName', bankName);
        formData.append("CurrYear", CurrYear);
        try {
            const response = await axios.post('http://localhost:7600/recon/saveData', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.status === 1) {
                const allData = response.data.data;
                setJsonData(allData);
                setDataUploaded(true);
                setDisplayData(allData.slice(0, 100)); // Display first 100 rows
                setShowTable(true);
                setSendButtonEnabled(false);
            }
            else if (response.data.status == 0) {
                setError(response.data.error)
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDownloadTXT = () => {
        try {
            const jsonDataAsString = JSON.stringify(jsonData, null, 2);
            const txtBlob = new Blob([jsonDataAsString], {
                type: 'text/plain',
            });

            saveAs(txtBlob, 'data.txt');
        } catch (err) {
            console.log("Error in Downloading txt", err);
        }
    };

    const handleSendData = async () => {
        if (sendButtonEnabled && !isSending) {
            setIsDropdownOpen(true);
        }
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfigData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleCreateConfig = async () => {
        try {
            const response = await axios.post('http://localhost:7600/recon/GetConfigInput', configData);
            if (response.data.status == 0) {
                setError(response.data.error)
            }
            if (response.data.status == 1) {
                setSuccess("Config Added Succesfully!!");
            }
        } catch (error) {
            setError(error.message);
        }
    };
    const handleOptionSelect = async (option) => {
        try {
            setIsDropdownOpen(false);
            if (option === 'Recon') {
                setReconOrOnRamp(1);
                setIsSending(true);
            } else if (option === 'onRamp') {
                setReconOrOnRamp(0);
                setIsSending(true);
            }
            let data = {
                "reconOrOnRamp": reconOrOnRamp
            }
            const response = await axios.post('http://localhost:7600/recon/addDataIntoDb', data)
        } catch (err) {
            console.log(err);
        }

    };
    return (
        <div>
            <div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
            <div>
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </div>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} accept="" />
                <input
                    type="text"
                    placeholder="AccountNumber"
                    value={accountNumber}
                    onChange={handleAccountChange}
                />
                <input
                    type="text"
                    placeholder="BankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="CurrYear"
                    value={CurrYear}
                    onChange={(e) => setCurrYear(e.target.value)}
                />
                <button type="submit">Upload and Display Data</button>
            </form>
            <button onClick={handleClearData}>Clear Uploaded Data</button>

            {dataUploaded == false && (
                <div>
                    <h3>Uploaded JSON Data</h3>
                    <pre>{JSON.stringify(uploadedData, null, 2)}</pre>
                </div>
            )}

            {showTable && (
                <div>
                    <DataDisplayTable data={displayData} />
                    <button onClick={handleDownloadTXT}>Download TXT</button>
                    <button onClick={handleSendData} disabled={!sendButtonEnabled || isSending}>
                        Create file to add into db
                    </button>
                    {isDropdownOpen && (
                        <div className="dropdown-modal">
                            <button onClick={() => handleOptionSelect('Recon')}>Recon</button>
                            <button onClick={() => handleOptionSelect('onRamp')}>onRamp</button>
                        </div>
                    )}
                </div>
            )}

            <button onClick={handleApproveData} disabled={sendButtonEnabled}>
                Approve Data
            </button>

            <div>
                <h3>Add Configuration Data</h3>
                {configProperties.map((property) => (
                    <label key={property}>
                        {property}:
                        <input
                            type="text"
                            placeholder={property}
                            name={property}
                            value={configData[property]}
                            onChange={handleConfigChange}
                        />
                    </label>
                ))}
                <button onClick={handleCreateConfig}>Create Config</button>
            </div>
        </div>
    );
};

export default FileUploadForm;
