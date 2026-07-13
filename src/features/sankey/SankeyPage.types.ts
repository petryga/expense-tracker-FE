export interface SankeyChartNode {
    id: string;
    name: string;
    color: string;
}

export interface SankeyChartLink {
    source: string;
    target: string;
    value: number;
    color: string;
}