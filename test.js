const longevityQuery = `
  query LongevityOfAttestations {
    findFirstAttestation(where: {
      revoked: { equals: false },
      timeCreated: { lte: 1696896000 } 
    }) {
      attester
      timeCreated
    }
  }
`;

const nonRevokedQuery = `
  query NonRevokedAttestations {
    attestations(where: { revoked: { equals: false } }) {
      attester
      recipient
    }
  }
`;

async function executeGraphQLQuery(query) {
  const response = await fetch("https://easscan.org/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}
async function processAttestations() {
  try {
    const longevityResults = await executeGraphQLQuery(longevityQuery);
    const nonRevokedResults = await executeGraphQLQuery(nonRevokedQuery);

    const scores = new Map();

    function updateScore(attester, points) {
      scores.set(attester, (scores.get(attester) || 0) + points);
    }

    // Higher points for non-revoked attestations
    nonRevokedResults.data.attestations.forEach(({ attester }) =>
      updateScore(attester, 10)
    );

    // Additional points for longevity
    const longevityAttestation = longevityResults.data.findFirstAttestation;
    if (longevityAttestation) {
      const longevityPoints = 5; // Base points for longevity
      updateScore(longevityAttestation.attester, longevityPoints);
    }

    const threshold = 20; // Adjusted threshold
    const eligibleAttestors = Array.from(scores)
      .filter(([_, score]) => score >= threshold)
      .map(([attester]) => attester);

    // Calculating total number of attesters and number of eligible attesters
    const totalAttesters = scores.size;
    const numberOfEligibleAttesters = eligibleAttestors.length;

    console.log("Total Attesters:", totalAttesters);
    console.log("Number of Eligible Attesters:", numberOfEligibleAttesters);
    console.log("Eligible Attestors:", eligibleAttestors);
  } catch (error) {
    console.error("Error processing attestations:", error);
  }
}

processAttestations();