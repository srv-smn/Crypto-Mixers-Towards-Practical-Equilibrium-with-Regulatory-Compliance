import React, { useState, useEffect } from "react";
import { MerkleTree } from "merkletreejs";
import SHA256 from "crypto-js/sha256";
import styles from "../style/MerkleTree.module.css";
//Dummy data
const leafNodesData = [
  [
    { id: "1", data: "Leaf 1" },
    { id: "2", data: "Leaf 2" },
    { id: "3", data: "Leaf 3" },
  ],
  [
    { id: "4", data: "Leaf 4" },
    { id: "5", data: "Leaf 5" },
    { id: "6", data: "Leaf 6" },
  ],
  [
    { id: "7", data: "Leaf 7" },
    { id: "8", data: "Leaf 8" },
    { id: "9", data: "Leaf 9" },
  ],
  [
    { id: "10", data: "Leaf 10" },
    { id: "11", data: "Leaf 11" },
    { id: "12", data: "Leaf 12" },
  ],
  [
    { id: "13", data: "Leaf 13" },
    { id: "14", data: "Leaf 14" },
    { id: "15", data: "Leaf 15" },
  ],
  [
    { id: "13", data: "Leaf 13" },
    { id: "14", data: "Leaf 14" },
    { id: "15", data: "Leaf 15" },
  ],
  [
    { id: "13", data: "Leaf 13" },
    { id: "14", data: "Leaf 14" },
    { id: "15", data: "Leaf 15" },
  ],
];

const createMerkleTree = (leafNodes) => {
  const leaves = leafNodes.map((node) => SHA256(node.data));
  return new MerkleTree(leaves, SHA256);
};

const truncateHash = (hash) =>
  `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;

function MerkleTreeComponent() {
  const [merkleTrees, setMerkleTrees] = useState([]);

  useEffect(() => {
    const newTrees = leafNodesData.map((nodes) => createMerkleTree(nodes));
    setMerkleTrees(newTrees);
  }, []);

  return (
    <div className={styles.gridContainer}>
      {merkleTrees.map((tree, treeIndex) => (
        <div key={treeIndex} className={styles.treeWrapper}>
          <div className={styles.tree}>
            {tree
              .getLayers()
              .reverse()
              .map((layer, index) => (
                <div key={index} className={styles.layer}>
                  {layer.map((hash, hashIndex) => (
                    <div key={hashIndex} className={styles.node}>
                      {truncateHash(hash.toString("hex"))}
                    </div>
                  ))}
                </div>
              ))}
          </div>
          <p className={styles.treeCaption}>Merkle Tree {treeIndex + 1}</p>
        </div>
      ))}
    </div>
  );
}

export default MerkleTreeComponent;
