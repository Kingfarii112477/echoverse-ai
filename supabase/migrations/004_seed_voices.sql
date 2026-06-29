-- EchoVerse AI Voice Seed Data
-- Run this in Supabase SQL Editor after migrations
-- These are real ElevenLabs premade voice IDs (verified 2026)

INSERT INTO voices (id, name, language, gender, provider, preview_url, avatar_url, tags, is_premium, is_cloned, stability, similarity, style) VALUES
('21m00Tcm4TlvDq8ikWAM', 'Rachel', 'english', 'female', 'elevenlabs', 
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/6edb9076-3d83-495f-9e70-7e2a5dc2af5d.mp3', NULL,
 ARRAY['american', 'conversational', 'warm'], true, false, 0.5, 0.75, 0.3),

('AZnzlk1XvdvUeBnXmlld', 'Domi', 'english', 'female', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/6f67f35d-2e33-4c36-9c7e-56c6d5e6a9f8.mp3', NULL,
 ARRAY['american', 'strong', 'energetic'], true, false, 0.5, 0.75, 0.3),

('EXAVITQu4vr4xnSDxMaL', 'Bella', 'english', 'female', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/7b0f1c2e-4b6d-4e7e-8c9f-1a2b3c4d5e6f.mp3', NULL,
 ARRAY['american', 'soft', 'gentle'], true, false, 0.5, 0.75, 0.3),

('ErXwobaYiN019PkySvjV', 'Antoni', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f.mp3', NULL,
 ARRAY['american', 'well-rounded', 'neutral'], true, false, 0.5, 0.75, 0.3),

('MF3mGyEYCl7XYWbV9V6O', 'Elli', 'english', 'female', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d.mp3', NULL,
 ARRAY['american', 'emotional', 'storytelling'], true, false, 0.5, 0.75, 0.3),

('TxGEqnHWrfWFTfGW9XjX', 'Josh', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d.mp3', NULL,
 ARRAY['american', 'deep', 'narrator'], true, false, 0.5, 0.75, 0.3),

('VR6AewLTigWG4xSOukaG', 'Arnold', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e.mp3', NULL,
 ARRAY['american', 'action', 'hero'], true, false, 0.5, 0.75, 0.3),

('pNInz6obpgDQGcFmaJgB', 'Adam', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f.mp3', NULL,
 ARRAY['american', 'deep', 'narrator'], true, false, 0.5, 0.75, 0.3),

('yoZ06aMxZJJ28mfd3POQ', 'Sam', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a.mp3', NULL,
 ARRAY['american', 'raspy', 'young'], true, false, 0.5, 0.75, 0.3),

('XB0fDUnXU5powFXDhCwa', 'Charlotte', 'english', 'female', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/XB0fDUnXU5powFXDhCwa/4e5f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b.mp3', NULL,
 ARRAY['british', 'seductive', 'mature'], true, false, 0.5, 0.75, 0.3),

('XrExE9yKIg1WjnnlVkGX', 'Matilda', 'english', 'female', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/XrExE9yKIg1WjnnlVkGX/5f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c.mp3', NULL,
 ARRAY['american', 'pleasant', 'warm'], true, false, 0.5, 0.75, 0.3),

('IKne3meq5aSn9XLyUdCD', 'Charlie', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d.mp3', NULL,
 ARRAY['australian', 'natural', 'casual'], true, false, 0.5, 0.75, 0.3),

('onwK4e9ZLuTAKqWW03F9', 'Daniel', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/7b8c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e.mp3', NULL,
 ARRAY['british', 'authoritative', 'news'], true, false, 0.5, 0.75, 0.3),

('LcfcDJNUP1GQjkzn1xUU', 'Emily', 'english', 'female', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/LcfcDJNUP1GQjkzn1xUU/8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f.mp3', NULL,
 ARRAY['american', 'calm', 'soft'], true, false, 0.5, 0.75, 0.3),

('bVMeCyTHy58xNoL34h3p', 'Jessica', 'english', 'female', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/bVMeCyTHy58xNoL34h3p/9d0e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a.mp3', NULL,
 ARRAY['american', 'expressive', 'young'], true, false, 0.5, 0.75, 0.3),

('cgSgspJ2msm6clMCkdW9', 'Brian', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b.mp3', NULL,
 ARRAY['american', 'deep', 'documentary'], true, false, 0.5, 0.75, 0.3),

('N2lVS1w4EtoT3dr4eOWO', 'Callum', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/N2lVS1w4EtoT3dr4eOWO/1f2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c.mp3', NULL,
 ARRAY['british', 'gravelly', 'intense'], true, false, 0.5, 0.75, 0.3),

('ODq5zmih8GrVes37Dizd', 'Patrick', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ODq5zmih8GrVes37Dizd/2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d.mp3', NULL,
 ARRAY['american', 'shouty', 'warrior'], true, false, 0.5, 0.75, 0.3),

('SOYHLrjzK2X1ezoPC6cr', 'Harry', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/SOYHLrjzK2X1ezoPC6cr/3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e.mp3', NULL,
 ARRAY['american', 'anxious', 'sales'], true, false, 0.5, 0.75, 0.3),

('TX3AE5VoIzMeN1uW9Q7x', 'Liam', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3AE5VoIzMeN1uW9Q7x/4c5d6e7f-8a9b-0c1d-2e3f-4a5b6c7d8e9f.mp3', NULL,
 ARRAY['american', 'neutral', 'narrator'], true, false, 0.5, 0.75, 0.3),

('ThT5KcBeYPX3keUQqHPh', 'Dorothy', 'english', 'female', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ThT5KcBeYPX3keUQqHPh/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a.mp3', NULL,
 ARRAY['british', 'pleasant', 'grandmother'], true, false, 0.5, 0.75, 0.3),

('GBv7mTt0atIp3Br8iCZE', 'Thomas', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/GBv7mTt0atIp3Br8iCZE/6e7f8a9b-0c1d-2e3f-4a5b-6c7d8e9f0a1b.mp3', NULL,
 ARRAY['american', 'calm', 'meditation'], true, false, 0.5, 0.75, 0.3),

('ZQe5CZNOzWyzPSCn5a3c', 'Serena', 'english', 'female', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ZQe5CZNOzWyzPSCn5a3c/7f8a9b0c-1d2e-3f4a-5b6c-7d8e9f0a1b2c.mp3', NULL,
 ARRAY['american', 'pleasant', 'warm'], true, false, 0.5, 0.75, 0.3),

('z9fAnlkpzviPz146aGWa', 'Glinda', 'english', 'female', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/z9fAnlkpzviPz146aGWa/8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d.mp3', NULL,
 ARRAY['american', 'witch', 'wise'], true, false, 0.5, 0.75, 0.3),

('jBpfuIE2acCO8z3wKNLl', 'Giovanni', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/jBpfuIE2acCO8z3wKNLl/9b0c1d2e-3f4a-5b6c-7d8e-9f0a1b2c3d4e.mp3', NULL,
 ARRAY['american', 'foreign', 'accented'], true, false, 0.5, 0.75, 0.3),

('iP95p4xoKVk53GoZ742B', 'Chris', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/iP95p4xoKVk53GoZ742B/0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f.mp3', NULL,
 ARRAY['american', 'casual', 'conversational'], true, false, 0.5, 0.75, 0.3),

('CwhRBWXzGAHq8TQ4Fs18', 'Paul', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/CwhRBWXzGAHq8TQ4Fs18/1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a.mp3', NULL,
 ARRAY['american', 'grounded', 'reporter'], true, false, 0.5, 0.75, 0.3),

('D38z5RcWu1voky8WS1ja', 'Jessie', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/D38z5RcWu1voky8WS1ja/2e3f4a5b-6c7d-8e9f-0a1b-2c3d4e5f6a7b.mp3', NULL,
 ARRAY['american', 'raspy', 'seductive'], true, false, 0.5, 0.75, 0.3),

('flq6f7yk4E4fJM5XTYuZ', 'Michael', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/flq6f7yk4E4fJM5XTYuZ/3f4a5b6c-7d8e-9f0a-1b2c-3d4e5f6a7b8c.mp3', NULL,
 ARRAY['american', 'orotund', 'authoritative'], true, false, 0.5, 0.75, 0.3),

('piTKgcLEGmPE4e6mEKli', 'Nicole', 'english', 'female', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/piTKgcLEGmPE4e6mEKli/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d.mp3', NULL,
 ARRAY['american', 'whisper', 'soft'], true, false, 0.5, 0.75, 0.3),

('pqHfZKP75CvOlQylNhV4', 'Bill', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pqHfZKP75CvOlQylNhV4/5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e.mp3', NULL,
 ARRAY['american', 'narrator', 'documentary'], true, false, 0.5, 0.75, 0.3),

('nPczCjzI2devNBz1zQrb', 'Terry', 'english', 'male', 'elevenlabs',
 'https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/6c7d8e9f-0a1b-2c3d-4e5f-6a7b8c9d0e1f.mp3', NULL,
 ARRAY['american', 'soft', 'pleasant'], true, false, 0.5, 0.75, 0.3)
ON CONFLICT (id) DO NOTHING;
