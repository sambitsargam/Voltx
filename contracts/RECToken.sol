// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title RECToken
 * @dev Renewable Energy Certificate (REC) Token for Voltx Hub
 * @notice This contract represents renewable energy certificates as ERC-20 tokens
 * Each token represents 1 MWh of renewable energy generation
 */
contract RECToken is ERC20, ERC20Burnable, Ownable, Pausable {
    
    // Events
    event RECMinted(address indexed to, uint256 amount, string facilityId, uint256 generationDate);
    event RECRetired(address indexed from, uint256 amount, string reason);
    event FacilityRegistered(string facilityId, address indexed owner, string facilityType);
    
    // Structs
    struct Facility {
        string facilityId;
        address owner;
        string facilityType; // "solar", "wind", "hydro", etc.
        bool isActive;
        uint256 totalGenerated;
        uint256 registrationDate;
    }
    
    // State variables
    mapping(string => Facility) public facilities;
    mapping(address => uint256) public retiredBalances;
    mapping(string => bool) public facilityExists;
    
    string[] public registeredFacilities;
    uint256 public totalRetired;
    uint256 public constant DECIMALS_MULTIPLIER = 10**18; // 1 token = 1 MWh
    
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        // Constructor body is now empty since Ownable handles ownership transfer in v5
    }
    
    /**
     * @dev Register a new renewable energy facility
     * @param facilityId Unique identifier for the facility
     * @param facilityOwner Address of the facility owner
     * @param facilityType Type of renewable energy (solar, wind, etc.)
     */
    function registerFacility(
        string memory facilityId,
        address facilityOwner,
        string memory facilityType
    ) external onlyOwner {
        require(!facilityExists[facilityId], "Facility already registered");
        require(facilityOwner != address(0), "Invalid facility owner");
        require(bytes(facilityId).length > 0, "Invalid facility ID");
        require(bytes(facilityType).length > 0, "Invalid facility type");
        
        facilities[facilityId] = Facility({
            facilityId: facilityId,
            owner: facilityOwner,
            facilityType: facilityType,
            isActive: true,
            totalGenerated: 0,
            registrationDate: block.timestamp
        });
        
        facilityExists[facilityId] = true;
        registeredFacilities.push(facilityId);
        
        emit FacilityRegistered(facilityId, facilityOwner, facilityType);
    }
    
    /**
     * @dev Mint RECs for verified renewable energy generation
     * @param to Address to mint tokens to
     * @param amountMWh Amount of energy in MWh
     * @param facilityId ID of the generating facility
     * @param generationDate Timestamp of energy generation
     */
    function mintREC(
        address to,
        uint256 amountMWh,
        string memory facilityId,
        uint256 generationDate
    ) external onlyOwner whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amountMWh > 0, "Amount must be greater than zero");
        require(facilityExists[facilityId], "Facility not registered");
        require(generationDate <= block.timestamp, "Invalid generation date");
        
        Facility storage facility = facilities[facilityId];
        require(facility.isActive, "Facility is not active");
        
        uint256 tokenAmount = amountMWh * DECIMALS_MULTIPLIER;
        facility.totalGenerated += amountMWh;
        
        _mint(to, tokenAmount);
        
        emit RECMinted(to, tokenAmount, facilityId, generationDate);
    }
    
    /**
     * @dev Retire (burn) RECs to claim environmental benefits
     * @param amount Amount of tokens to retire
     * @param reason Reason for retirement
     */
    function retireREC(uint256 amount, string memory reason) external whenNotPaused {
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(bytes(reason).length > 0, "Retirement reason required");
        
        retiredBalances[msg.sender] += amount;
        totalRetired += amount;
        
        _burn(msg.sender, amount);
        
        emit RECRetired(msg.sender, amount, reason);
    }
    
    /**
     * @dev Batch mint RECs for multiple recipients
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts (in MWh)
     * @param facilityId ID of the generating facility
     * @param generationDate Timestamp of energy generation
     */
    function batchMintREC(
        address[] memory recipients,
        uint256[] memory amounts,
        string memory facilityId,
        uint256 generationDate
    ) external onlyOwner whenNotPaused {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        require(facilityExists[facilityId], "Facility not registered");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0) && amounts[i] > 0) {
                uint256 tokenAmount = amounts[i] * DECIMALS_MULTIPLIER;
                facilities[facilityId].totalGenerated += amounts[i];
                
                _mint(recipients[i], tokenAmount);
                
                emit RECMinted(recipients[i], tokenAmount, facilityId, generationDate);
            }
        }
    }
    
    /**
     * @dev Get facility information
     * @param facilityId ID of the facility
     * @return Facility struct
     */
    function getFacility(string memory facilityId) external view returns (Facility memory) {
        require(facilityExists[facilityId], "Facility not found");
        return facilities[facilityId];
    }
    
    /**
     * @dev Get total number of registered facilities
     * @return Number of facilities
     */
    function getFacilityCount() external view returns (uint256) {
        return registeredFacilities.length;
    }
    
    /**
     * @dev Get retired balance for an address
     * @param account Address to check
     * @return Retired token amount
     */
    function getRetiredBalance(address account) external view returns (uint256) {
        return retiredBalances[account];
    }
    
    /**
     * @dev Toggle facility active status
     * @param facilityId ID of the facility
     */
    function toggleFacilityStatus(string memory facilityId) external onlyOwner {
        require(facilityExists[facilityId], "Facility not found");
        facilities[facilityId].isActive = !facilities[facilityId].isActive;
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override _update to add pause functionality (OpenZeppelin v5)
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override whenNotPaused {
        super._update(from, to, value);
    }
}
