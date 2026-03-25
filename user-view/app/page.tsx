'use client'

import { useState, useEffect } from 'react'
import partyData from './data.json'

export default function LoginPage() {
  const [nickname, setNickname] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [loginError, setLoginError] = useState('') 
  
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<number, string>>({})
  const [pendingPhoto, setPendingPhoto] = useState<{ tileId: number; imageUrl: string } | null>(null)

  useEffect(() => {
    const savedName = localStorage.getItem('bingo_user_name')
    if (savedName) setIsJoined(true)
  }, [])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (nickname.trim().length >= 3) {
      localStorage.setItem('bingo_user_name', nickname.trim())
      setIsJoined(true)
      setLoginError('')
    } else {
      setLoginError('⚠️ El nombre debe tener al menos 3 letras')
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, tileId: number) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setPendingPhoto({ tileId, imageUrl }) 
    }
  }

  const confirmPhoto = () => {
    if (pendingPhoto) {
      setUploadedPhotos(prev => ({ ...prev, [pendingPhoto.tileId]: pendingPhoto.imageUrl }))
      setPendingPhoto(null) 
    }
  }

  const cancelPhoto = () => {
    setPendingPhoto(null) 
  }

  // --- VISTA A: EL TABLERO DE BINGO ---
  if (isJoined) {
    const name = localStorage.getItem('bingo_user_name') || nickname
    const columns = 3; 
    const grid_size = 12; 
    const emptySlotsCount = grid_size - partyData.tiles.length; 
    const preferredFreeIndices = [4, 7, 10, 1]; 
    const activeFreeIndices = new Set(preferredFreeIndices.slice(0, emptySlotsCount)); 

    const finalCells = [];
    let tilePointer = 0;

    for (let i = 0; i < grid_size; i++) {
        if (activeFreeIndices.has(i)) {
            finalCells.push({ type: 'FREE', icon: '⭐', text: 'FREE' });
        } else {
            const tile = partyData.tiles[tilePointer];
            if (tile) {
                finalCells.push({ ...tile, type: 'TILE' }); 
                tilePointer++;
            } else {
                finalCells.push({ type: 'FREE', icon: '⭐', text: 'FREE' });
            }
        }
    }

    return (
      <>
        {/* === CONTENEDOR PRINCIPAL === */}
        <div className="min-h-screen bg-[#fdf8e1] p-4 text-black flex flex-col items-center pb-24">
          
          <header className="w-full max-w-sm bg-white border-4 border-black rounded-2xl p-4 mb-6 mt-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute -left-3 top-1/2 w-6 h-6 bg-[#fdf8e1] border-r-4 border-black rounded-full -translate-y-1/2"></div>
            <div className="absolute -right-3 top-1/2 w-6 h-6 bg-[#fdf8e1] border-l-4 border-black rounded-full -translate-y-1/2"></div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase text-center mb-1 leading-none">
              {partyData.party_config.name}
            </h1>
            <div className="flex justify-between items-center border-t-2 border-dashed border-gray-400 pt-2 mt-2">
              <p className="font-bold text-sm text-gray-500 uppercase">
                ID: <span className="text-black">{name}</span>
              </p>
              <button 
                onClick={() => { localStorage.removeItem('bingo_user_name'); setIsJoined(false); }}
                className="text-[10px] font-bold text-red-500 underline uppercase tracking-wider"
              >
                Cambiar Player
              </button>
            </div>
          </header>

          <div className="w-full max-w-sm bg-white border-4 border-black p-3 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid grid-cols-3 gap-2">
              {finalCells.map((cell, index) => {
                const isFree = cell.type === 'FREE';
                const cellId = 'id' in cell ? cell.id : undefined;
                const photoUrl = cellId ? uploadedPhotos[cellId] : null;
                const isDone = !!photoUrl;
                const isClickable = !isDone && !isFree && cellId;

                const baseClasses = "relative flex flex-col items-center justify-center text-center aspect-square transition-all select-none rounded-xl border-2 border-black p-1 overflow-hidden";
                const freeClasses = "bg-[#FFDE00] opacity-80";
                const clickableClasses = "bg-[#AEE2FF] cursor-pointer hover:bg-[#FFDE00]";
                const doneClasses = "border-4 border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]"; 

                if (isClickable) {
                  return (
                    <label key={cellId} className={`${baseClasses} ${clickableClasses}`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={(e) => handlePhotoUpload(e, cellId)}
                      />
                      {/* AQUÍ ESTABA EL BUG: Eliminado z-10, dejamos solo relative */}
                      <span className="text-2xl sm:text-3xl mb-1 relative">{cell.icon || '📷'}</span>
                      <span className="text-[9px] sm:text-[11px] font-black uppercase leading-[1.1] line-clamp-3 px-1 relative">
                        {cell.text}
                      </span>
                    </label>
                  )
                }

                return (
                  <div key={cellId ? cellId : `free-${index}`} className={`${baseClasses} ${isFree ? freeClasses : ''} ${isDone ? doneClasses : ''}`}>
                    {photoUrl && (
                      <img src={photoUrl} alt="Reto" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    )}
                    {/* AQUÍ ESTABA EL BUG: Eliminado z-10, dejamos solo relative */}
                    <span className="text-2xl sm:text-3xl mb-1 relative">{cell.icon || '📷'}</span>
                    <span className={` ${isFree ? 'text-[10px]' : 'text-[9px] sm:text-[11px]'} font-black uppercase leading-[1.1] line-clamp-3 px-1 relative`}>
                      {cell.text}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40">
            <button className="w-full bg-black text-white py-4 rounded-full font-black text-lg uppercase flex items-center justify-center gap-2 shadow-[0px_8px_0px_0px_rgba(100,100,100,1)] hover:bg-gray-800 hover:translate-y-1 hover:shadow-[0px_4px_0px_0px_rgba(100,100,100,1)] transition-all">
              📸 VER FEED GLOBAL
            </button>
          </div>
        </div>

        {/* === POPUP DE CONFIRMACIÓN === */}
        {pendingPhoto && (
          // Usando bg-opacity-90 por si falla el formato abreviado en tu navegador
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-90">
            <div className="bg-white border-4 border-black p-6 rounded-3xl w-full max-w-sm shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-black flex flex-col items-center">
              <h2 className="text-2xl font-black text-center mb-6 italic tracking-tighter uppercase leading-none">¿Estás seguro/a?</h2>
              
              <img 
                src={pendingPhoto.imageUrl} 
                alt="Previsualización" 
                className="w-full h-auto aspect-square object-cover border-4 border-black rounded-xl mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gray-200"
              />
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={cancelPhoto}
                  className="flex-1 bg-red-100 border-4 border-red-600 text-red-600 py-3.5 rounded-xl font-black text-lg uppercase shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  Repetir
                </button>
                <button 
                  onClick={confirmPhoto}
                  className="flex-1 bg-green-400 border-4 border-black text-black py-3.5 rounded-xl font-black text-lg uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // --- VISTA B: PANTALLA DE LOGIN ---
  return (
    <div className="min-h-screen bg-[#AEE2FF] flex flex-col items-center justify-center p-6 text-black relative">
      <div className="absolute top-10 left-10 text-3xl opacity-50">⭐</div>
      <div className="absolute bottom-20 right-10 text-3xl opacity-50">✨</div>

      <div className="w-full max-w-sm bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black relative z-10">
        <h1 className="text-3xl font-black text-center mb-8 italic tracking-tighter uppercase leading-none">
          BINGO PARTY
        </h1>
        
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <label className="font-bold text-sm uppercase ml-1">¿Tu Nickname?</label>
          <input 
            type="text" 
            placeholder="Ej: Paula_99"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-4 border-3 border-black text-black rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#FFDE00]"
            maxLength={15}
          />
          
          {loginError && <p className="text-red-600 text-xs font-bold -mt-2">{loginError}</p>}

          <button 
            type="submit"
            className="w-full bg-[#FFDE00] border-4 border-black text-black py-4 rounded-xl font-black text-xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
          >
            ¡ENTRAR!
          </button>
        </form>
      </div>
    </div>
  )
}