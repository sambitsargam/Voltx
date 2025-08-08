// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Enhanced Voltx Renewable Energy Certificate (REC) Token
 * @dev Advanced ERC20 token for managing renewable energy certificates with facility management
 */
contract EnhancedRECToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    struct Facility {
        string facilityId;
        string name;
        string location;
        string energyType;
        uint256 capacity; // in kW
        bool isActive;
        uint256 totalGenerated; // Total VREC tokens generated
        uint256 registrationTime;
        address registeredBy;
    }
    
    struct Transaction {
        address from;
        address to;
        uint256 amount;
        string transactionType; // "mint", "transfer", "burn", "retire"
        string facilityId;
        uint256 timestamp;
        string metadata;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(uint256 => Facility) public facilities;
    mapping(string => uint256) public facilityIdToIndex;
    mapping(string => bool) public facilityExists;
    
    Transaction[] public transactions;
    mapping(address => uint256[]) public userTransactions;
    
    string[] public registeredFacilities; // Array of facility IDs
    uint256 public facilityCount;
    
    // Retirement tracking
    mapping(address => uint256) public retiredTokens;
    uint256 public totalRetired;
    
    // Price and trading
    uint256 public tokenPrice = 1e15; // 0.001 ETH per VREC (can be updated)
    bool public tradingEnabled = true;
    
    // ============ EVENTS ============
    
    event FacilityRegistered(
        string indexed facilityId,
        string name,
        string location,
        string energyType,
        uint256 capacity,
        address registeredBy
    );
    
    event FacilityStatusChanged(string indexed facilityId, bool isActive);
    
    event TokensMinted(
        address indexed to,
        uint256 amount,
        string indexed facilityId,
        string metadata
    );
    
    event TokensRetired(
        address indexed by,
        uint256 amount,
        string reason
    );
    
    event TransactionRecorded(
        address indexed from,
        address indexed to,
        uint256 amount,
        string transactionType,
        string facilityId
    );
    
    event TokenPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event TradingStatusChanged(bool enabled);
    
    // ============ CONSTRUCTOR ============
    
    constructor() ERC20("Voltx Renewable Energy Certificate", "VREC") Ownable(msg.sender) {
        // Mint initial supply to owner
        _mint(msg.sender, 10000 * 10**decimals());
        
        // Record initial mint transaction
        _recordTransaction(
            address(0),
            msg.sender,
            10000 * 10**decimals(),
            "mint",
            "INITIAL",
            "Initial token supply"
        );
    }
    
    // ============ FACILITY MANAGEMENT ============
    
    /**
     * @dev Register a new renewable energy facility
     */
    function registerFacility(
        string memory _facilityId,
        string memory _name,
        string memory _location,
        string memory _energyType,
        uint256 _capacity
    ) external onlyOwner {
        require(!facilityExists[_facilityId], "Facility already exists");
        require(bytes(_facilityId).length > 0, "Facility ID cannot be empty");
        require(bytes(_name).length > 0, "Facility name cannot be empty");
        require(_capacity > 0, "Capacity must be greater than 0");
        
        uint256 facilityIndex = facilityCount;
        
        facilities[facilityIndex] = Facility({
            facilityId: _facilityId,
            name: _name,
            location: _location,
            energyType: _energyType,
            capacity: _capacity,
            isActive: true,
            totalGenerated: 0,
            registrationTime: block.timestamp,
            registeredBy: msg.sender
        });
        
        facilityIdToIndex[_facilityId] = facilityIndex;
        facilityExists[_facilityId] = true;
        registeredFacilities.push(_facilityId);
        facilityCount++;
        
        emit FacilityRegistered(_facilityId, _name, _location, _energyType, _capacity, msg.sender);
    }
    
    /**
     * @dev Update facility status (active/inactive)
     */
    function updateFacilityStatus(string memory _facilityId, bool _isActive) external onlyOwner {
        require(facilityExists[_facilityId], "Facility does not exist");
        
        uint256 facilityIndex = facilityIdToIndex[_facilityId];
        facilities[facilityIndex].isActive = _isActive;
        
        emit FacilityStatusChanged(_facilityId, _isActive);
    }
    
    /**
     * @dev Get facility details by ID
     */
    function getFacility(string memory _facilityId) external view returns (Facility memory) {
        require(facilityExists[_facilityId], "Facility does not exist");
        uint256 facilityIndex = facilityIdToIndex[_facilityId];
        return facilities[facilityIndex];
    }
    
    /**
     * @dev Get all registered facility IDs
     */
    function getAllFacilities() external view returns (string[] memory) {
        return registeredFacilities;
    }
    
    /**
     * @dev Get facility count
     */
    function getFacilityCount() external view returns (uint256) {
        return facilityCount;
    }
    
    // ============ TOKEN MINTING ============
    
    /**
     * @dev Mint tokens for energy generation from a specific facility
     */
    function mintFromFacility(
        address _to,
        uint256 _amount,
        string memory _facilityId,
        string memory _metadata
    ) external onlyOwner {
        require(facilityExists[_facilityId], "Facility does not exist");
        require(_amount > 0, "Amount must be greater than 0");
        
        uint256 facilityIndex = facilityIdToIndex[_facilityId];
        require(facilities[facilityIndex].isActive, "Facility is not active");
        
        // Update facility total generated
        facilities[facilityIndex].totalGenerated += _amount;
        
        // Mint tokens
        _mint(_to, _amount);
        
        // Record transaction
        _recordTransaction(address(0), _to, _amount, "mint", _facilityId, _metadata);
        
        emit TokensMinted(_to, _amount, _facilityId, _metadata);
    }
    
    /**
     * @dev Mint tokens (general purpose)
     */
    function mint(address _to, uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        _mint(_to, _amount);
        
        _recordTransaction(address(0), _to, _amount, "mint", "GENERAL", "General mint");
        emit TokensMinted(_to, _amount, "GENERAL", "General mint");
    }
    
    // ============ TOKEN RETIREMENT ============
    
    /**
     * @dev Retire tokens (permanent removal representing used RECs)
     */
    function retireTokens(uint256 _amount, string memory _reason) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        // Burn the tokens
        _burn(msg.sender, _amount);
        
        // Update retirement tracking
        retiredTokens[msg.sender] += _amount;
        totalRetired += _amount;
        
        // Record transaction
        _recordTransaction(msg.sender, address(0), _amount, "retire", "", _reason);
        
        emit TokensRetired(msg.sender, _amount, _reason);
    }
    
    // ============ ENHANCED TRANSFERS ============
    
    /**
     * @dev Enhanced transfer with metadata
     */
    function transferWithMetadata(
        address _to,
        uint256 _amount,
        string memory _metadata
    ) external nonReentrant returns (bool) {
        require(tradingEnabled, "Trading is currently disabled");
        require(_to != address(0), "Transfer to zero address");
        require(_amount > 0, "Amount must be greater than 0");
        
        bool success = transfer(_to, _amount);
        if (success) {
            _recordTransaction(msg.sender, _to, _amount, "transfer", "", _metadata);
        }
        return success;
    }
    
    // Override transfer to record transactions
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(tradingEnabled, "Trading is currently disabled");
        bool success = super.transfer(to, amount);
        if (success) {
            _recordTransaction(msg.sender, to, amount, "transfer", "", "Standard transfer");
        }
        return success;
    }
    
    // Override transferFrom to record transactions
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(tradingEnabled, "Trading is currently disabled");
        bool success = super.transferFrom(from, to, amount);
        if (success) {
            _recordTransaction(from, to, amount, "transfer", "", "Approved transfer");
        }
        return success;
    }
    
    // ============ TRANSACTION HISTORY ============
    
    /**
     * @dev Record a transaction in history
     */
    function _recordTransaction(
        address _from,
        address _to,
        uint256 _amount,
        string memory _type,
        string memory _facilityId,
        string memory _metadata
    ) internal {
        Transaction memory newTransaction = Transaction({
            from: _from,
            to: _to,
            amount: _amount,
            transactionType: _type,
            facilityId: _facilityId,
            timestamp: block.timestamp,
            metadata: _metadata
        });
        
        transactions.push(newTransaction);
        uint256 transactionIndex = transactions.length - 1;
        
        // Add to user transaction history
        if (_from != address(0)) {
            userTransactions[_from].push(transactionIndex);
        }
        if (_to != address(0) && _to != _from) {
            userTransactions[_to].push(transactionIndex);
        }
        
        emit TransactionRecorded(_from, _to, _amount, _type, _facilityId);
    }
    
    /**
     * @dev Get user's transaction history
     */
    function getUserTransactions(address _user) external view returns (uint256[] memory) {
        return userTransactions[_user];
    }
    
    /**
     * @dev Get transaction details by index
     */
    function getTransaction(uint256 _index) external view returns (Transaction memory) {
        require(_index < transactions.length, "Transaction index out of bounds");
        return transactions[_index];
    }
    
    /**
     * @dev Get total number of transactions
     */
    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }
    
    // ============ PRICING & TRADING ============
    
    /**
     * @dev Update token price (in wei)
     */
    function updateTokenPrice(uint256 _newPrice) external onlyOwner {
        uint256 oldPrice = tokenPrice;
        tokenPrice = _newPrice;
        emit TokenPriceUpdated(oldPrice, _newPrice);
    }
    
    /**
     * @dev Toggle trading status
     */
    function setTradingEnabled(bool _enabled) external onlyOwner {
        tradingEnabled = _enabled;
        emit TradingStatusChanged(_enabled);
    }
    
    /**
     * @dev Buy tokens with ETH
     */
    function buyTokens() external payable nonReentrant {
        require(tradingEnabled, "Trading is currently disabled");
        require(msg.value > 0, "Must send ETH to buy tokens");
        require(tokenPrice > 0, "Token price not set");
        
        uint256 tokenAmount = (msg.value * 10**decimals()) / tokenPrice;
        require(tokenAmount > 0, "Token amount must be greater than 0");
        
        // Mint tokens to buyer
        _mint(msg.sender, tokenAmount);
        
        // Record transaction
        _recordTransaction(
            address(0),
            msg.sender,
            tokenAmount,
            "purchase",
            "",
            string(abi.encodePacked("Purchased with ", msg.value, " wei"))
        );
        
        emit TokensMinted(msg.sender, tokenAmount, "", "Token purchase");
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user's retired token balance
     */
    function getRetiredBalance(address _user) external view returns (uint256) {
        return retiredTokens[_user];
    }
    
    /**
     * @dev Get total retired tokens
     */
    function getTotalRetired() external view returns (uint256) {
        return totalRetired;
    }
    
    /**
     * @dev Get current token price
     */
    function getTokenPrice() external view returns (uint256) {
        return tokenPrice;
    }
    
    /**
     * @dev Check if trading is enabled
     */
    function isTradingEnabled() external view returns (bool) {
        return tradingEnabled;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Withdraw ETH from contract (from token sales)
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ETH withdrawal failed");
    }
    
    /**
     * @dev Emergency pause/unpause trading
     */
    function emergencyToggleTrading() external onlyOwner {
        tradingEnabled = !tradingEnabled;
        emit TradingStatusChanged(tradingEnabled);
    }
    
    // ============ FALLBACK ============
    
    receive() external payable {
        if (msg.value > 0 && tradingEnabled && tokenPrice > 0) {
            uint256 tokenAmount = (msg.value * 10**decimals()) / tokenPrice;
            if (tokenAmount > 0) {
                _mint(msg.sender, tokenAmount);
                _recordTransaction(
                    address(0),
                    msg.sender,
                    tokenAmount,
                    "purchase",
                    "",
                    string(abi.encodePacked("Auto-purchase with ", msg.value, " wei"))
                );
                emit TokensMinted(msg.sender, tokenAmount, "", "Auto token purchase");
            }
        }
    }
}
