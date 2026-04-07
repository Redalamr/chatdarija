import React from 'react';
import { Link } from 'react-router-dom';
import { Character } from '../types';
import { motion } from 'motion/react';

interface Props {
  character: Character;
}

export const CharacterCard: React.FC<Props> = ({ character }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg hover:border-zinc-700 transition-colors"
    >
      <Link to={`/chat/${character.id}`}>
        <img
          src={character.avatar_url}
          alt={character.name}
          className="w-full h-48 object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="p-4">
          <h3 className="text-xl font-bold text-white mb-2">{character.name}</h3>
          <p className="text-zinc-400 text-sm line-clamp-2">
            {character.short_description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};
