export interface Character {
  id: string;
  name: string;
  avatar_url: string;
  short_description: string;
  system_prompt: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
