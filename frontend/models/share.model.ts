export interface Share {
	id: string;
	owner: string;
	supply: number;
	numberOfHolders: number;
	numberOfHoldings: number;
	buyPrice: number;
	sellPrice: number;
	tradingFeesAmount: number;
}
