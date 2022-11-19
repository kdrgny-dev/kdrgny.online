import React from 'react'
import { Player } from '@lottiefiles/react-lottie-player';

export default function Loading() {
  return <Player
    src='/loading.json'
    className="w-80 h-80"
    autoplay
    loop
  />
}
