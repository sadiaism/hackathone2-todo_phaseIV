import axios, { AxiosResponse } from 'axios';

// Define TypeScript interfaces for our API responses
export interface AICommandRequest {
  command: string;
  context?: {
    user_timezone?: string;
    preferred_format?: string;
  };
}

export interface AICommandResponse {
  status: 'success' | 'error';
  result?: {
    type: string;
    message: string;
    task?: any;
  };
  tool_used?: string;
  execution_time_ms?: number;
  error_code?: string;
  message?: string;
  suggestions?: string[];
}

export interface AIValidationRequest {
  command: string;
}

export interface AIValidationResponse {
  status: 'success' | 'error';
  validation_result?: {
    valid: boolean;
    suggested_tool: string;
    parsed_intent: string;
    confidence: number;
    extracted_parameters: any;
  };
  message?: string;
}

export interface AIHistoryResponse {
  status: 'success' | 'error';
  interactions?: Array<{
    id: string;
    input_text: string;
    selected_tool: string;
    result_status: string;
    result_message: string;
    timestamp: string;
    execution_time_ms?: number;
  }>;
  total_count: number;
  message?: string;
}

class AIAgentService {
  private baseURL: string;
  private authToken: string | null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1') {
    this.baseURL = baseURL;
    this.authToken = null;
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  // Get authorization header
  private getAuthHeaders(): { [key: string]: string } {
    if (!this.authToken) {
      throw new Error('Authentication token is required');
    }

    return {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
  }

  // Execute a natural language command
  async executeCommand(request: AICommandRequest): Promise<AxiosResponse<AICommandResponse>> {
    try {
      const response = await axios.post<AICommandResponse>(
        `${this.baseURL}/ai-agent/execute-command`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || error.message;
      }
      throw error;
    }
  }

  // Validate a command without executing it
  async validateCommand(request: AIValidationRequest): Promise<AxiosResponse<AIValidationResponse>> {
    try {
      const response = await axios.post<AIValidationResponse>(
        `${this.baseURL}/ai-agent/validate-command`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || error.message;
      }
      throw error;
    }
  }

  // Get command history for the current user
  async getCommandHistory(limit: number = 10): Promise<AxiosResponse<AIHistoryResponse>> {
    try {
      const response = await axios.get<AIHistoryResponse>(
        `${this.baseURL}/ai-agent/history?limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || error.message;
      }
      throw error;
    }
  }
}

// Create a singleton instance
const aiAgentService = new AIAgentService();

export default aiAgentService;