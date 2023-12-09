
import React, { useState, useEffect } from 'react';
import { MerkleTree } from 'merkletreejs';
import SHA256 from 'crypto-js/sha256';
import styles from '../style/MerkleTree.module.css';
import AadhaarComponent from '../components/Adhar';

// export default MerkleTreeComponent;
const leafNodesData = [
  [
    { id: "1", data: "Leaf 1" },
    { id: "2", data: "Leaf 2" },
    { id: "3", data: "Leaf 3" },
     { id: "3", data: "Leaf 3" }, { id: "3", data: "Leaf 3" },
  ],
   [
    { id: "1", data: "Leaf 1" },
    { id: "2", data: "Leaf 2" },
    { id: "3", data: "Leaf 3" },
     { id: "3", data: "Leaf 3" }, { id: "3", data: "Leaf 3" },
  ],
  [
    { id: "4", data: "Leaf 4" },
    { id: "5", data: "Leaf 5" },
    { id: "6", data: "Leaf 6" },
  ],
  [
    { id: "4", data: "Leaf 4" },
    { id: "5", data: "Leaf 5" },
    { id: "6", data: "Leaf 6" },
  ],
];
const treeDescriptions = [
  "Basic ASP",
  "Anyone Aadhar",
  "Third Tree Description",
  "Fourth Tree Description",
  "Fifth Tree Description",
];
const treeDetails = [
  {
    heading: "Basic ASP",
    subheading: "Subheading for Basic ASP",
    description: "This is a description for Basic ASP. Here you can add more details about the tree, the logic behind it, and any other relevant information that users might find useful."
  },
  {
    heading: "Anyone Aadhar",
    subheading: "Subheading for Anyone Aadhar",
    description: "This description changes when 'Anyone Aadhar' is selected. It could contain information about the Aadhar tree, its purpose, and how it works."
  },
  
  {
    heading: "Anyone Aadhar",
    subheading: "Subheading for Anyone Aadhar",
    description: "This description changes when 'Anyone Aadhar' is selected. It could contain information about the Aadhar tree, its purpose, and how it works."
  },
  {
    heading: "Anyone Aadhar",
    subheading: "Subheading for Anyone Aadhar",
    description: "This description changes when 'Anyone Aadhar' is selected. It could contain information about the Aadhar tree, its purpose, and how it works."
  },
  {
    heading: "Anyone Aadhar",
    subheading: "Subheading for Anyone Aadhar",
    description: "This description changes when 'Anyone Aadhar' is selected. It could contain information about the Aadhar tree, its purpose, and how it works."
  },
  // ... add more descriptions for each tree
];

const createMerkleTree = (leafNodes) => {
  const leaves = leafNodes.map((node) => SHA256(node.data));
  return new MerkleTree(leaves, SHA256);
};

const truncateHash = (hash) =>
  `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;

function MerkleTreeComponent() {
  const [selectedTreeIndex, setSelectedTreeIndex] = useState(0);
  const [merkleTrees, setMerkleTrees] = useState([]);

  useEffect(() => {
    const newTrees = leafNodesData.map((nodes) => createMerkleTree(nodes));
    setMerkleTrees(newTrees);
  }, []);

  const selectedTreeDetails = treeDetails[selectedTreeIndex];

  return (
    <div className={styles.mainContainer}>
      <div className={styles.dropdownContainer}>
        <select
          className={styles.treeSelector}
          value={selectedTreeIndex}
          onChange={(e) => setSelectedTreeIndex(parseInt(e.target.value, 10))}
        >
          {treeDescriptions.map((description, index) => (
            <option key={index} value={index}>{description}</option>
          ))}
        </select>
        <div className={styles.treeDisplay}>
          <h1 className={styles.mainHeading}>Merkle tree</h1>
          {/* Display selected Merkle Tree */}
          {merkleTrees[selectedTreeIndex] &&
            merkleTrees[selectedTreeIndex]
              .getLayers()
              .reverse()
              .map((layer, index) => (
                <div key={index} className={`${styles.layer} ${styles[`layer${index}`]}`}>
                  {layer.map((hash, hashIndex) => (
                    <div key={hashIndex} className={styles.node}>
                      {truncateHash(hash.toString("hex"))}
                    </div>
                  ))}
                </div>
              ))}
        </div>
      </div>
      <div className={styles.detailsContainer}>
        <div className={styles.description}>
          <h1>{selectedTreeDetails.heading}</h1>
          <h2>{selectedTreeDetails.subheading}</h2>
          <p>{selectedTreeDetails.description}</p>
        </div>
        {selectedTreeIndex === 1 && <AadhaarComponent />}
      </div>
    </div>
  );
}

export default MerkleTreeComponent;