const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RECToken", function () {
  let RECToken;
  let recToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy contract
    RECToken = await ethers.getContractFactory("RECToken");
    recToken = await RECToken.deploy(
      "Voltx Renewable Energy Certificate",
      "VREC",
      owner.address
    );
    await recToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await recToken.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await recToken.name()).to.equal("Voltx Renewable Energy Certificate");
      expect(await recToken.symbol()).to.equal("VREC");
    });

    it("Should have 18 decimals", async function () {
      expect(await recToken.decimals()).to.equal(18);
    });

    it("Should start with zero total supply", async function () {
      expect(await recToken.totalSupply()).to.equal(0);
    });
  });

  describe("Facility Registration", function () {
    it("Should register a new facility", async function () {
      await recToken.registerFacility("SOLAR-001", addr1.address, "solar");
      
      const facility = await recToken.getFacility("SOLAR-001");
      expect(facility.facilityId).to.equal("SOLAR-001");
      expect(facility.owner).to.equal(addr1.address);
      expect(facility.facilityType).to.equal("solar");
      expect(facility.isActive).to.be.true;
      expect(facility.totalGenerated).to.equal(0);
    });

    it("Should emit FacilityRegistered event", async function () {
      await expect(recToken.registerFacility("WIND-001", addr1.address, "wind"))
        .to.emit(recToken, "FacilityRegistered")
        .withArgs("WIND-001", addr1.address, "wind");
    });

    it("Should not allow duplicate facility registration", async function () {
      await recToken.registerFacility("SOLAR-001", addr1.address, "solar");
      
      await expect(
        recToken.registerFacility("SOLAR-001", addr2.address, "wind")
      ).to.be.revertedWith("Facility already registered");
    });

    it("Should only allow owner to register facilities", async function () {
      await expect(
        recToken.connect(addr1).registerFacility("SOLAR-001", addr1.address, "solar")
      ).to.be.revertedWithCustomError(recToken, "OwnableUnauthorizedAccount");
    });

    it("Should reject invalid facility parameters", async function () {
      // Empty facility ID
      await expect(
        recToken.registerFacility("", addr1.address, "solar")
      ).to.be.revertedWith("Invalid facility ID");

      // Zero address owner
      await expect(
        recToken.registerFacility("SOLAR-001", ethers.ZeroAddress, "solar")
      ).to.be.revertedWith("Invalid facility owner");

      // Empty facility type
      await expect(
        recToken.registerFacility("SOLAR-001", addr1.address, "")
      ).to.be.revertedWith("Invalid facility type");
    });
  });

  describe("REC Minting", function () {
    beforeEach(async function () {
      await recToken.registerFacility("SOLAR-001", addr1.address, "solar");
    });

    it("Should mint RECs correctly", async function () {
      const amountMWh = 100;
      const expectedTokens = ethers.parseEther(amountMWh.toString());
      const generationDate = Math.floor(Date.now() / 1000) - 86400;

      await recToken.mintREC(addr1.address, amountMWh, "SOLAR-001", generationDate);

      expect(await recToken.balanceOf(addr1.address)).to.equal(expectedTokens);
      expect(await recToken.totalSupply()).to.equal(expectedTokens);

      const facility = await recToken.getFacility("SOLAR-001");
      expect(facility.totalGenerated).to.equal(amountMWh);
    });

    it("Should emit RECMinted event", async function () {
      const amountMWh = 50;
      const expectedTokens = ethers.parseEther(amountMWh.toString());
      const generationDate = Math.floor(Date.now() / 1000) - 86400;

      await expect(
        recToken.mintREC(addr1.address, amountMWh, "SOLAR-001", generationDate)
      )
        .to.emit(recToken, "RECMinted")
        .withArgs(addr1.address, expectedTokens, "SOLAR-001", generationDate);
    });

    it("Should only allow owner to mint", async function () {
      await expect(
        recToken.connect(addr1).mintREC(addr1.address, 100, "SOLAR-001", Math.floor(Date.now() / 1000))
      ).to.be.revertedWithCustomError(recToken, "OwnableUnauthorizedAccount");
    });

    it("Should reject minting for unregistered facility", async function () {
      await expect(
        recToken.mintREC(addr1.address, 100, "UNKNOWN-001", Math.floor(Date.now() / 1000))
      ).to.be.revertedWith("Facility not registered");
    });

    it("Should reject future generation dates", async function () {
      const futureDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow

      await expect(
        recToken.mintREC(addr1.address, 100, "SOLAR-001", futureDate)
      ).to.be.revertedWith("Invalid generation date");
    });
  });

  describe("REC Retirement", function () {
    beforeEach(async function () {
      await recToken.registerFacility("SOLAR-001", addr1.address, "solar");
      await recToken.mintREC(addr1.address, 100, "SOLAR-001", Math.floor(Date.now() / 1000) - 86400);
    });

    it("Should retire RECs correctly", async function () {
      const retireAmount = ethers.parseEther("50");
      const initialBalance = await recToken.balanceOf(addr1.address);

      await recToken.connect(addr1).retireREC(retireAmount, "Carbon offset for company operations");

      expect(await recToken.balanceOf(addr1.address)).to.equal(initialBalance - retireAmount);
      expect(await recToken.getRetiredBalance(addr1.address)).to.equal(retireAmount);
      expect(await recToken.totalRetired()).to.equal(retireAmount);
    });

    it("Should emit RECRetired event", async function () {
      const retireAmount = ethers.parseEther("25");
      const reason = "Carbon neutrality initiative";

      await expect(
        recToken.connect(addr1).retireREC(retireAmount, reason)
      )
        .to.emit(recToken, "RECRetired")
        .withArgs(addr1.address, retireAmount, reason);
    });

    it("Should reject retirement with insufficient balance", async function () {
      const excessiveAmount = ethers.parseEther("200");

      await expect(
        recToken.connect(addr1).retireREC(excessiveAmount, "Test retirement")
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should require retirement reason", async function () {
      const retireAmount = ethers.parseEther("10");

      await expect(
        recToken.connect(addr1).retireREC(retireAmount, "")
      ).to.be.revertedWith("Retirement reason required");
    });
  });

  describe("Batch Minting", function () {
    beforeEach(async function () {
      await recToken.registerFacility("SOLAR-001", addr1.address, "solar");
    });

    it("Should batch mint to multiple recipients", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [50, 75];
      const generationDate = Math.floor(Date.now() / 1000) - 86400;

      await recToken.batchMintREC(recipients, amounts, "SOLAR-001", generationDate);

      expect(await recToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("50"));
      expect(await recToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("75"));

      const facility = await recToken.getFacility("SOLAR-001");
      expect(facility.totalGenerated).to.equal(125);
    });

    it("Should reject mismatched array lengths", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [50]; // Mismatched length

      await expect(
        recToken.batchMintREC(recipients, amounts, "SOLAR-001", Math.floor(Date.now() / 1000))
      ).to.be.revertedWith("Arrays length mismatch");
    });
  });

  describe("Facility Management", function () {
    beforeEach(async function () {
      await recToken.registerFacility("SOLAR-001", addr1.address, "solar");
    });

    it("Should toggle facility status", async function () {
      let facility = await recToken.getFacility("SOLAR-001");
      expect(facility.isActive).to.be.true;

      await recToken.toggleFacilityStatus("SOLAR-001");

      facility = await recToken.getFacility("SOLAR-001");
      expect(facility.isActive).to.be.false;

      // Should not be able to mint for inactive facility
      await expect(
        recToken.mintREC(addr1.address, 100, "SOLAR-001", Math.floor(Date.now() / 1000))
      ).to.be.revertedWith("Facility is not active");
    });

    it("Should return correct facility count", async function () {
      expect(await recToken.getFacilityCount()).to.equal(1);

      await recToken.registerFacility("WIND-001", addr2.address, "wind");
      expect(await recToken.getFacilityCount()).to.equal(2);
    });
  });

  describe("Pausable Functionality", function () {
    beforeEach(async function () {
      await recToken.registerFacility("SOLAR-001", addr1.address, "solar");
      await recToken.mintREC(addr1.address, 100, "SOLAR-001", Math.floor(Date.now() / 1000) - 86400);
    });

    it("Should pause and unpause contract", async function () {
      await recToken.pause();
      expect(await recToken.paused()).to.be.true;

      // Should reject operations when paused
      await expect(
        recToken.mintREC(addr1.address, 50, "SOLAR-001", Math.floor(Date.now() / 1000))
      ).to.be.revertedWithCustomError(recToken, "EnforcedPause");

      await expect(
        recToken.connect(addr1).retireREC(ethers.parseEther("10"), "Test")
      ).to.be.revertedWithCustomError(recToken, "EnforcedPause");

      // Unpause and operations should work
      await recToken.unpause();
      expect(await recToken.paused()).to.be.false;

      await recToken.mintREC(addr1.address, 50, "SOLAR-001", Math.floor(Date.now() / 1000) - 86400);
    });

    it("Should only allow owner to pause/unpause", async function () {
      await expect(
        recToken.connect(addr1).pause()
      ).to.be.revertedWithCustomError(recToken, "OwnableUnauthorizedAccount");

      await recToken.pause();

      await expect(
        recToken.connect(addr1).unpause()
      ).to.be.revertedWithCustomError(recToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transfer Functionality", function () {
    beforeEach(async function () {
      await recToken.registerFacility("SOLAR-001", addr1.address, "solar");
      await recToken.mintREC(addr1.address, 100, "SOLAR-001", Math.floor(Date.now() / 1000) - 86400);
    });

    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseEther("25");

      await recToken.connect(addr1).transfer(addr2.address, transferAmount);

      expect(await recToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("75"));
      expect(await recToken.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("Should not allow transfers when paused", async function () {
      await recToken.pause();

      await expect(
        recToken.connect(addr1).transfer(addr2.address, ethers.parseEther("10"))
      ).to.be.revertedWithCustomError(recToken, "EnforcedPause");
    });
  });
});
