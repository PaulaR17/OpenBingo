'use client'

import { useState, useEffect } from 'react'
import partyData from './data.json' // Asegúrate de haber actualizado el JSON a 10 casillas

export default function LoginPage() {
  const [nickname, setNickname] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  // NUEVO: Estado para guardar las fotos (relaciona el ID de la casilla con la imagen)
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<number, string>>({})

  // NUEVO: Función que se ejecuta al hacer la foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, tileId: number) => {
    const file = e.target.files?.[0]
    if (file) {
      // Creamos una URL temporal para mostrar la foto instantáneamente en la pantalla
      const imageUrl = URL.createObjectURL(file)
      setUploadedPhotos(prev => ({ ...prev, [tileId]: imageUrl }))
    }
  }

  useEffect(() => {
    const savedName = localStorage.getItem('bingo_user_name')
    if (savedName) setIsJoined(true)
  }, [])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (nickname.trim().length > 2) {
      localStorage.setItem('bingo_user_name', nickname)
      setIsJoined(true)
    } else {
      alert("¡Ponte un nombre un poco más largo! (mínimo 3 letras)")
    }
  }

  // --- VISTA A: EL TABLERO DE BINGO (Mobile First with Integrated FREE slots) ---
  if (isJoined) {
    const name = localStorage.getItem('bingo_user_name')
    
    // NUEVA LÓGICA MÁGICA PARA QUE EL CARTÓN SIEMPRE QUEDE CUADRADO E INTEGRADO:
    const columns = 3; 
    
    // Definimos el tamaño total del cartón (multiplos de columns). Para 10-12 casillas, 3x4=12 es ideal para móvil.
    // Luego lo haremos dinámico según el JSON, pero para empezar con funcionalidad móvil, forzamos un tamaño ideal.
    const grid_size = 12; // Un tablero de 3x4 (12 casillas)

    // Calculamos cuántas casillas "FREE" (Comodín) necesitamos
    const emptySlotsCount = grid_size - partyData.tiles.length; // 12 - 10 = 2 FREE slots

    // Definimos posiciones específicas (índices del 0 al grid_size-1) para "embetir" las casillas FREE.
    // Para 3 columnas x 4 filas, el índice 4 es el centro de la 2ª fila, el 7 el centro de la 3ª.
    // Estos formarán una columna central vertical simétrica.
    const preferredFreeIndices = [4, 7, 10, 1]; // sorted set of FREE indices.

    // Creamos un Set con los índices FREE activos para este N.
    const activeFreeIndices = new Set(preferredFreeIndices.slice(0, emptySlotsCount)); // Para 10 items, usará [4, 7]

    // Array para guardar los objetos de casillas finales (o un reto o un "FREE")
    const finalCells = [];

    // Puntero para el reto actual de partyData.tiles
    let tilePointer = 0;

    // Rellenamos el array finalCells de tamaño grid_size
    for (let i = 0; i < grid_size; i++) {
        if (activeFreeIndices.has(i)) {
            // Renderizamos una casilla "FREE"
            finalCells.push({ type: 'FREE', icon: '⭐', text: 'FREE' });
        } else {
            // Renderizamos un reto de partyData.tiles
            const tile = partyData.tiles[tilePointer];
            if (tile) {
                finalCells.push({ ...tile, type: 'TILE' }); // añadimos tipo para claridad
                tilePointer++;
            } else {
                // Si no hay más retos (no debería pasar con la lógica de arriba, pero por si acaso), rellenamos con FREE
                finalCells.push({ type: 'FREE', icon: '⭐', text: 'FREE' });
            }
        }
    }

    return (
      <div className="min-h-screen bg-[#fdf8e1] p-4 text-black flex flex-col items-center pb-24">
        
        {/* CABECERA ESTILO TICKET (No changes) */}
        <header className="w-full max-w-sm bg-white border-4 border-black rounded-2xl p-4 mb-6 mt-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Adorno perforation ... */}
          <div className="absolute -left-3 top-1/2 w-6 h-6 bg-[#fdf8e1] border-r-4 border-black rounded-full -translate-y-1/2"></div>
          <div className="absolute -right-3 top-1/2 w-6 h-6 bg-[#fdf8e1] border-l-4 border-black rounded-full -translate-y-1/2"></div>
          
          <h1 className="text-2xl font-black italic tracking-tighter uppercase text-center mb-1">
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

        {/* EL CARTÓN DE BINGO (Grid 3 columnas fijo para móvil, with embedded FREE slots) */}
        <div className="w-full max-w-sm bg-white border-4 border-black p-3 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid grid-cols-3 gap-2">
            
            {/* Mapeamos los retos combinados (items and interspersed FREE slots) */}
            {finalCells.map((cell, index) => {
              const isFree = cell.type === 'FREE';

              return (
                <div 
                  key={'id' in cell ? cell.id : `free-${index}`}
                  // Condicionalmente fijamos el fondo para las casillas FREE
                  className={`
                    ${isFree ? 'bg-[#FFDE00]' : 'bg-[#AEE2FF]'}
                    border-2 border-black rounded-xl p-1 flex flex-col items-center justify-center text-center aspect-square 
                    transition-transform select-none
                    ${isFree ? 'opacity-80' : 'active:scale-95 active:bg-[#FFDE00]'}
                  `}
                >
                  <span className="text-2xl sm:text-3xl mb-1">{cell.icon || '📷'}</span>
                  <span className={`
                    ${isFree ? 'text-[10px]' : 'text-[9px] sm:text-[11px]'}
                    font-black uppercase leading-[1.1] line-clamp-3 px-1
                  `}>
                    {cell.text}
                  </span>
                </div>
              )
            })}

          </div>
        </div>

        {/* BOTÓN FLOTANTE PARA EL FEED (Muy móvil, No changes) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
          <button className="w-full bg-black text-white py-4 rounded-full font-black text-lg uppercase flex items-center justify-center gap-2 shadow-[0px_8px_0px_0px_rgba(100,100,100,1)] active:shadow-none active:translate-y-2 transition-all">
            📸 VER FEED GLOBAL
          </button>
        </div>

      </div>
    )
  }

  // --- VISTA B: PANTALLA DE LOGIN (No changes) ---
  return (
    <div className="min-h-screen bg-[#AEE2FF] flex flex-col items-center justify-center p-6 text-black">
      <div className="absolute top-10 left-10 text-3xl opacity-50">⭐</div>
      <div className="absolute bottom-20 right-10 text-3xl opacity-50">✨</div>

      <div className="w-full max-w-sm bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black relative z-10">
        <h1 className="text-3xl font-black text-center mb-8 italic tracking-tighter">
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
          <button 
            type="submit"
            className="w-full bg-[#FFDE00] border-4 border-black text-black py-4 rounded-xl font-black text-xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all select-none"
          >
            ¡ENTRAR!
          </button>
        </form>
      </div>
    </div>
  )
}