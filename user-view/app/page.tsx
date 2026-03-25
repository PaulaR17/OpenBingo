'use client'

import { useState, useEffect, useRef } from 'react' 
import partyData from './data.json'

export default function LoginPage() {
  // --- ESTADOS ---
  const [nickname, setNickname] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [loginError, setLoginError] = useState('') 
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<number, string>>({})
  const [pendingPhoto, setPendingPhoto] = useState<{ tileId: number; imageUrl: string } | null>(null)
  const [viewingPhoto, setViewingPhoto] = useState<{ id: number; photoUrl: string; text: string; icon: string } | null>(null)

  // --- REFS ---
  const retakeInputRef = useRef<HTMLInputElement>(null)

  // --- EFECTOS ---
  // Al cargar, si ya existe el nombre en el navegador, entramos directo
  useEffect(() => {
    const savedName = localStorage.getItem('bingo_user_name')
    if (savedName) setIsJoined(true)
  }, [])

  // --- LÓGICA DE USUARIO ---
  const handleJoin = () => {
    const cleanName = nickname.trim();
    if (cleanName.length >= 3) {
      try {
        localStorage.setItem('bingo_user_name', cleanName);
        setIsJoined(true);
        setLoginError('');
      } catch (err) {
        // Por si el móvil bloquea el almacenamiento, dejamos entrar igual
        setIsJoined(true);
      }
    } else {
      setLoginError('⚠️ Mínimo 3 letras');
    }
  };

  const handleResetUser = () => {
    localStorage.clear();
    window.location.reload();
  };

  // --- LÓGICA DE FOTOS ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, tileId: number) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setPendingPhoto({ tileId, imageUrl }) 
    }
  }

  const handleRetakeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!viewingPhoto) return;
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setViewingPhoto(null); 
      setPendingPhoto({ tileId: viewingPhoto.id, imageUrl }); 
    }
    e.target.value = '';
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

  // --- RENDERIZADO DEL TABLERO ---
  if (isJoined) {
    const name = localStorage.getItem('bingo_user_name') || nickname
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
        <div className="min-h-screen bg-[#fdf8e1] p-4 text-black flex flex-col items-center pb-24">
          
          <header className="w-full max-w-sm bg-white border-4 border-black rounded-2xl p-4 mb-6 mt-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute -left-3 top-1/2 w-6 h-6 bg-[#fdf8e1] border-r-4 border-black rounded-full -translate-y-1/2"></div>
            <div className="absolute -right-3 top-1/2 w-6 h-6 bg-[#fdf8e1] border-l-4 border-black rounded-full -translate-y-1/2"></div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase text-center mb-1 leading-none">
              {partyData.party_config.name}
            </h1>
            <div className="flex justify-center items-center border-t-2 border-dashed border-gray-400 pt-2 mt-2">
              <p className="font-bold text-sm text-gray-500 uppercase">
                PLAYER: <span className="text-black">{name}</span>
              </p>
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
                const clickableClasses = "bg-[#AEE2FF] cursor-pointer active:bg-[#FFDE00]";
                const doneClasses = "border-4 border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]"; 

                // 1. CASILLA DISPONIBLE
                if (isClickable) {
                  return (
                    <label key={cellId} className={`${baseClasses} ${clickableClasses}`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        style={{ display: 'none' }} 
                        onChange={(e) => handlePhotoUpload(e, cellId)}
                      />
                      <span className="text-2xl sm:text-3xl mb-1">{cell.icon || '📷'}</span>
                      <span className="text-[9px] sm:text-[11px] font-black uppercase leading-[1.1] line-clamp-3 px-1">
                        {cell.text}
                      </span>
                    </label>
                  )
                }

                // 2. CASILLA COMPLETADA (Ver detalle)
                if (isDone && cellId) {
                  return (
                    <button 
                      type="button"
                      key={cellId} 
                      className={`${baseClasses} ${doneClasses} active:scale-95`}
                      onClick={() => setViewingPhoto({ id: cellId, photoUrl, text: cell.text, icon: cell.icon || '📷' })}
                    >
                      <img src={photoUrl} alt="Reto" className="absolute inset-0 w-full h-full object-cover" />
                    </button>
                  )
                }

                // 3. CASILLA FREE
                return (
                  <div key={`free-${index}`} className={`${baseClasses} ${freeClasses}`}>
                    <span className="text-2xl sm:text-3xl mb-1">{cell.icon || '⭐'}</span>
                    <span className="text-[10px] font-black uppercase leading-[1.1]">{cell.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40">
            <button className="w-full bg-black text-white py-4 rounded-full font-black text-lg uppercase shadow-[0px_8px_0px_0px_rgba(100,100,100,1)] active:translate-y-1 active:shadow-[0px_4px_0px_0px_rgba(100,100,100,1)] transition-all">
              📸 VER FEED GLOBAL
            </button>
          </div>
        </div>

        {/* MODAL: VER FOTO DETALLE */}
        {viewingPhoto && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white border-4 border-black p-6 rounded-3xl w-full max-w-sm shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-black">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">{viewingPhoto.icon}</span>
                <span className="text-sm font-black uppercase text-center">{viewingPhoto.text}</span>
              </div>
              <img src={viewingPhoto.photoUrl} alt="Detail" className="w-full aspect-square object-cover border-4 border-black rounded-xl mb-6" />
              <div className="flex gap-4 w-full">
                <button onClick={() => setViewingPhoto(null)} className="flex-1 bg-gray-200 border-4 border-black py-3 rounded-xl font-black uppercase active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Cerrar</button>
                <button onClick={() => retakeInputRef.current?.click()} className="flex-1 bg-[#FFDE00] border-4 border-black py-3 rounded-xl font-black uppercase active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Repetir</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CONFIRMACIÓN DE FOTO */}
        {pendingPhoto && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white border-4 border-black p-6 rounded-3xl w-full max-w-sm shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-black">
              <h2 className="text-2xl font-black mb-6 uppercase italic tracking-tighter">¿Confirmas la foto?</h2>
              <img src={pendingPhoto.imageUrl} alt="Preview" className="w-full aspect-square object-cover border-4 border-black rounded-xl mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
              <div className="flex gap-4 w-full">
                <button onClick={cancelPhoto} className="flex-1 bg-red-100 border-4 border-red-600 text-red-600 py-3 rounded-xl font-black uppercase active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">Repetir</button>
                <button onClick={confirmPhoto} className="flex-1 bg-green-400 border-4 border-black py-3 rounded-xl font-black uppercase active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">SÍ</button>
              </div>
            </div>
          </div>
        )}

        <input type="file" accept="image/*" capture="environment" ref={retakeInputRef} style={{ display: 'none' }} onChange={handleRetakeSelect} />
      </>
    )
  }

  // --- VISTA B: LOGIN ---
  return (
    <div className="min-h-screen bg-[#AEE2FF] flex flex-col items-center justify-center p-6 text-black">
      <div className="w-full max-w-sm bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-black text-center mb-8 italic uppercase tracking-tighter">BINGO PARTY</h1>
        
        {/* Usamos un div para evitar el envío de formulario accidental en móviles */}
        <div className="flex flex-col gap-4">
          <label className="font-bold text-sm uppercase">Tu Nickname</label>
          <input 
            type="text" 
            placeholder="Ej: Paula_99"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            className="w-full p-4 border-4 border-black rounded-xl font-bold text-lg focus:outline-none bg-white"
          />
          
          {loginError && <p className="text-red-600 text-xs font-bold">{loginError}</p>}

         <button
          type="button"
          onClick={() => {
            alert('CLICK OK')
            handleJoin()
          }}
          className="w-full bg-[#FFDE00] border-4 border-black py-4 rounded-xl font-black text-xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none select-none"
        >
          ¡ENTRAR!
        </button>

          {/* BOTÓN DE EMERGENCIA */}
          <button 
            type="button"
            onClick={handleResetUser}
            className="mt-8 text-[10px] text-gray-400 underline uppercase text-center font-bold"
          >
            Limpiar caché y resetear usuario
          </button>
        </div>
      </div>
    </div>
  )
}