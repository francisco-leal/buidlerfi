const query = `
  {
    shareParticipants(first: 100) {
      id
      owner
      supply
      numberOfHolders
      numberOfHoldings
      buyPrice
      sellPrice
      tradingFeesAmount
    }
    shareRelationships(first: 100) {
      id
      holder {
        id
        owner
        supply
        numberOfHolders
        numberOfHoldings
        buyPrice
        sellPrice
        tradingFeesAmount
      }
      owner {
        id
        owner
        supply
        numberOfHolders
        numberOfHoldings
        buyPrice
        sellPrice
        tradingFeesAmount
      }
      supporterNumber
      heldKeyNumber
    }
  }
`;

export const fetchTheGraphData = async () => {
	const data = await fetch('https://api.thegraph.com/subgraphs/name/francisco-leal/buidlerfi-eth-singapore', {
		method: 'POST',
		body: JSON.stringify({
			query,
		}),
		headers: {
			'Content-Type': 'application/json',
		},
	}).then((res) => res.json());

	return data;
};
