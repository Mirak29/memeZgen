import { useEffect, useRef, useState } from 'preact/hooks'

type TextItem = {
  id: number
  text: string
  fontSize: number
  color: string
  fontFamily: string
  position: 'top' | 'bottom' | 'center'
  x?: number
  y?: number
}

export function Editor() {
  const availableFonts = [
    {
      name: 'Impact',
      value: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
    },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Comic Sans', value: 'Comic Sans MS, cursive, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, Times, serif' },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Courier New', value: 'Courier New, Courier, monospace' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { name: 'Lucida Console', value: 'Lucida Console, Monaco, monospace' },
    { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  ]

  const [texts, setTexts] = useState<TextItem[]>([
    {
      id: 1,
      text: 'Text Position 1',
      fontSize: 40,
      color: '#FFFFFF',
      fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
      position: 'top',
    },
    {
      id: 2,
      text: 'Text Position 2',
      fontSize: 40,
      color: '#FFFFFF',
      fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
      position: 'bottom',
    },
  ])
  const [showSettings, setShowSettings] = useState(false)
  const [editingTextId, setEditingTextId] = useState<number | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [filename, setFilename] = useState('meme')

  const memeRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load saved data on mount
  useEffect(() => {
    try {
      // Get template from URL params
      const params = new URLSearchParams(globalThis.location.search)
      const template = params.get('template')
      if (template) {
        setImageSrc(decodeURIComponent(template))
      } else {
        // Load from localStorage if no URL template
        const savedImageSrc = localStorage.getItem('memeEditor_imageSrc')
        if (savedImageSrc) {
          setImageSrc(savedImageSrc)
        }
      }

      // Load saved texts
      const savedTexts = localStorage.getItem('memeEditor_texts')
      if (savedTexts) {
        setTexts(JSON.parse(savedTexts))
      }

      // Load saved filename
      const savedFilename = localStorage.getItem('memeEditor_filename')
      if (savedFilename) {
        setFilename(savedFilename)
      }
    } catch (error) {
      console.error('Error loading saved data:', error)
    }
  }, [])

  const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string
        setImageSrc(imageSrc)
        // Save to localStorage
        localStorage.setItem('memeEditor_imageSrc', imageSrc)
      }
      reader.readAsDataURL(file)
    }
  }

  const addText = () => {
    const newTexts: TextItem[] = [
      ...texts,
      {
        id: Date.now(),
        text: 'New Text',
        fontSize: 40,
        color: '#FFFFFF',
        fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
        position: 'center' as const,
      },
    ]
    setTexts(newTexts)
    saveTextsToStorage(newTexts)
  }

  const saveTextsToStorage = (newTexts: TextItem[]) => {
    localStorage.setItem('memeEditor_texts', JSON.stringify(newTexts))
  }

  const updateText = (id: number, newText: string) => {
    const updatedTexts = []
    for (const t of texts) {
      if (t.id === id) {
        updatedTexts.push({ ...t, text: newText })
      } else {
        updatedTexts.push(t)
      }
    }
    setTexts(updatedTexts)
    saveTextsToStorage(updatedTexts)
  }

  const deleteText = (id: number) => {
    const updatedTexts = texts.filter((t) => t.id !== id)
    setTexts(updatedTexts)
    saveTextsToStorage(updatedTexts)
  }

  const openSettingsFor = (id: number) => {
    setEditingTextId(id)
    setShowSettings(true)
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const closeSettings = () => {
    setShowSettings(false)
  }

  const handleModalClick = (e: MouseEvent) => {
    // Close if clicking on backdrop
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      closeSettings()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSettings) {
        closeSettings()
      }
    }

    if (showSettings) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [showSettings])

  const updateTextProperty = (
    id: number,
    property: keyof TextItem,
    value: string | number,
  ) => {
    const updatedTexts = []
    for (const t of texts) {
      if (t.id === id) {
        updatedTexts.push({ ...t, [property]: value })
      } else {
        updatedTexts.push(t)
      }
    }
    setTexts(updatedTexts)
    saveTextsToStorage(updatedTexts)
  }

  const updateTextPosition = (id: number, x: number, y: number) => {
    const updatedTexts = []
    for (const t of texts) {
      if (t.id === id) {
        updatedTexts.push({ ...t, x, y })
      } else {
        updatedTexts.push(t)
      }
    }
    setTexts(updatedTexts)
    saveTextsToStorage(updatedTexts)
  }

  const handleDeleteAndClose = () => {
    if (textToEdit) {
      deleteText(textToEdit.id)
      setShowSettings(false)
    }
  }

  const generateMemeCanvas = (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      if (!memeRef.current || !imageSrc) {
        reject(new Error('Image or meme container not found.'))
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const memeContainer = memeRef.current
      const rect = memeContainer.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const imageAspectRatio = img.naturalWidth / img.naturalHeight
        const canvasAspectRatio = canvas.width / canvas.height
        let renderWidth: number,
          renderHeight: number,
          offsetX: number,
          offsetY: number

        if (imageAspectRatio > canvasAspectRatio) {
          renderWidth = canvas.width
          renderHeight = canvas.width / imageAspectRatio
          offsetX = 0
          offsetY = (canvas.height - renderHeight) / 2
        } else {
          renderHeight = canvas.height
          renderWidth = canvas.height * imageAspectRatio
          offsetX = (canvas.width - renderWidth) / 2
          offsetY = 0
        }

        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight)

        for (const textItem of texts) {
          // Use stored position or default position
          let xPercent = textItem.x
          let yPercent = textItem.y

          if (xPercent === undefined || yPercent === undefined) {
            // Use default position based on textItem.position
            switch (textItem.position) {
              case 'top':
                xPercent = 50
                yPercent = 10
                break
              case 'bottom':
                xPercent = 50
                yPercent = 85
                break
              case 'center':
                xPercent = 50
                yPercent = 50
                break
              default: {
                const _: never = textItem.position
                xPercent = 50
                yPercent = 50
                break
              }
            }
          }

          const x = (xPercent / 100) * canvas.width
          const y = (yPercent / 100) * canvas.height

          ctx.font = `${textItem.fontSize || 40}px ${textItem.fontFamily}`
          ctx.fillStyle = textItem.color || '#FFFFFF'
          ctx.strokeStyle = 'black'
          ctx.lineWidth = 4
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          ctx.strokeText(textItem.text, x, y)
          ctx.fillText(textItem.text, x, y)
        }
        resolve(canvas)
      }
      img.onerror = (err) => reject(err)
      img.src = imageSrc
    })
  }

  const downloadMeme = async () => {
    try {
      if (!imageSrc) {
        alert('Please select an image first!')
        return
      }

      console.log('Starting meme download...')
      const canvas = await generateMemeCanvas()
      console.log(
        'Canvas generated successfully:',
        canvas.width,
        'x',
        canvas.height,
      )

      canvas.toBlob((blob) => {
        if (blob) {
          console.log('Blob created, size:', blob.size)

          // Official MDN approach
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = `${filename}.png`
          link.click()
          URL.revokeObjectURL(link.href)

          console.log('Download initiated')
        } else {
          console.error('Failed to create blob')
          alert('Failed to create image. Please try again.')
        }
      }, 'image/png')
    } catch (error) {
      console.error('Error downloading meme:', error)
      alert(
        `Failed to download meme: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      )
    }
  }

  const textToEdit = texts.find((t) => t.id === editingTextId)

  return (
    <div class='w-full flex flex-col lg:flex-row min-h-[calc(100vh-120px)]'>
      {/* Meme Canvas */}
      <div class='flex-grow flex items-center justify-center p-2 sm:p-4 lg:p-8 order-2 lg:order-1'>
        <div
          ref={memeRef}
          class='relative w-full max-w-lg aspect-square overflow-hidden bg-white rounded-lg shadow-lg border border-slate-200 flex items-center justify-center'
        >
          {imageSrc
            ? (
              <>
                <img
                  src={imageSrc}
                  alt='Meme template'
                  class='w-full h-full object-contain'
                />
                {texts.map((textItem) => (
                  <DraggableText
                    key={textItem.id}
                    textItem={textItem}
                    onDelete={deleteText}
                    onUpdatePosition={updateTextPosition}
                  />
                ))}
              </>
            )
            : (
              <div class='text-center text-slate-400 p-8'>
                <h3 class='text-xl font-semibold mb-2'>MemeZgen</h3>
                <p class='text-sm'>
                  Select a template or upload your own image to start creating.
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Sidebar */}
      <div class='w-full lg:w-80 bg-white/95 backdrop-blur-sm p-3 sm:p-6 flex flex-col gap-4 order-1 lg:order-2 border-l border-slate-200'>
        <h2 class='text-xl sm:text-2xl font-bold text-center text-slate-800'>
          Edit Your Meme
        </h2>

        <div class='grid grid-cols-2 gap-3'>
          {/* Upload image */}
          <button
            type='button'
            onClick={handleUpload}
            class='btn bg-white border-slate-200 text-slate-700 hover:border-cyan-400 hover:bg-cyan-50'
          >
            <svg
              class='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
              />
            </svg>
            Upload
          </button>

          {/* Add text */}
          <button
            type='button'
            onClick={addText}
            class='btn bg-white border-slate-200 text-slate-700 hover:border-cyan-400 hover:bg-cyan-50'
          >
            <svg
              class='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
              />
            </svg>
            Add Text
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleImageUpload}
          class='hidden'
        />

        {/* Text editor list */}
        <div class='flex flex-col gap-3'>
          {texts.map((textItem, index) => (
            <div
              key={textItem.id}
              class='flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm'
            >
              <input
                type='text'
                value={textItem.text}
                onInput={(e) =>
                  updateText(textItem.id, (e.target as HTMLInputElement).value)}
                class='flex-grow input input-sm bg-white text-slate-800 placeholder-slate-400 border-slate-200 focus:border-cyan-400'
                placeholder={`Text position ${index + 1}`}
              />
              <button
                type='button'
                onClick={() => openSettingsFor(textItem.id)}
                class='btn btn-ghost btn-sm text-slate-500 hover:text-slate-700'
              >
                <svg
                  class='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                  />
                  <path
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Filename input */}
        <div class='form-control'>
          <label class='label'>
            <span class='label-text text-slate-800 font-medium'>Filename</span>
          </label>
          <input
            type='text'
            value={filename}
            maxLength={20}
            onInput={(e) => {
              const newFilename = (e.target as HTMLInputElement).value
              setFilename(newFilename)
              // Save to localStorage
              localStorage.setItem('memeEditor_filename', newFilename)
            }}
            class='input input-sm bg-white text-slate-800 border-slate-200 focus:border-cyan-400'
            placeholder='Enter meme name (max 20 chars)'
          />
        </div>

        {/* Download button */}
        <div class='flex flex-col gap-3 mt-auto'>
          <button
            type='button'
            onClick={downloadMeme}
            class='btn btn-primary w-full'
          >
            <svg
              class='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            Download as {filename}.png
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && textToEdit && (
        <div
          class='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop'
          onClick={handleModalClick}
        >
          <div
            class='bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-slate-200 shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div class='mb-4'>
              <h3 class='text-xl font-bold text-slate-800'>Edit Text</h3>
              <p class='text-sm text-slate-500 mt-1'>
                Press Esc or click outside to close
              </p>
            </div>

            <div class='space-y-4'>
              <div class='form-control'>
                <label class='label'>
                  <span class='label-text text-slate-700'>
                    Font Size: {textToEdit.fontSize}px
                  </span>
                </label>
                <input
                  type='range'
                  min='20'
                  max='100'
                  step='2'
                  value={textToEdit.fontSize}
                  onChange={(e) =>
                    updateTextProperty(
                      textToEdit.id,
                      'fontSize',
                      parseInt((e.target as HTMLInputElement).value),
                    )}
                  class='range range-primary'
                />
              </div>

              <div class='form-control'>
                <label class='label'>
                  <span class='label-text text-slate-700'>Text Color</span>
                </label>
                <div class='flex items-center gap-2'>
                  <input
                    type='color'
                    value={textToEdit.color}
                    onChange={(e) =>
                      updateTextProperty(
                        textToEdit.id,
                        'color',
                        (e.target as HTMLInputElement).value,
                      )}
                    class='w-12 h-10 rounded-lg border border-slate-300 cursor-pointer'
                  />
                  <input
                    type='text'
                    value={textToEdit.color}
                    onChange={(e) =>
                      updateTextProperty(
                        textToEdit.id,
                        'color',
                        (e.target as HTMLInputElement).value,
                      )}
                    class='flex-grow input input-sm bg-white text-slate-800 border-slate-200 focus:border-cyan-400'
                    placeholder='#FFFFFF'
                  />
                </div>
              </div>

              <div class='form-control'>
                <label class='label'>
                  <span class='label-text text-slate-700'>Font Family</span>
                </label>
                <select
                  value={textToEdit.fontFamily}
                  onChange={(e) =>
                    updateTextProperty(
                      textToEdit.id,
                      'fontFamily',
                      (e.target as HTMLSelectElement).value,
                    )}
                  class='select select-bordered bg-white text-slate-800 border-slate-200 focus:border-cyan-400'
                >
                  {availableFonts.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type='button'
                onClick={handleDeleteAndClose}
                class='btn btn-error w-full'
              >
                Delete Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DraggableText({ textItem, onDelete, onUpdatePosition }: {
  textItem: TextItem
  onDelete: (id: number) => void
  onUpdatePosition: (id: number, x: number, y: number) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState(() => {
    if (textItem.x !== undefined && textItem.y !== undefined) {
      return { x: textItem.x, y: textItem.y }
    }
    switch (textItem.position) {
      case 'top':
        return { x: 50, y: 10 }
      case 'bottom':
        return { x: 50, y: 85 }
      case 'center':
        return { x: 50, y: 50 }
      default: {
        const _: never = textItem.position
        return { x: 50, y: 50 }
      }
    }
  })

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }

  const handleDeleteText = () => {
    onDelete(textItem.id)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const container = (e.target as HTMLElement).closest('.aspect-square')
    if (!container) return

    const rect = container.getBoundingClientRect()
    const newX = ((e.clientX - rect.left) / rect.width) * 100
    const newY = ((e.clientY - rect.top) / rect.height) * 100

    const clampedX = Math.max(5, Math.min(95, newX))
    const clampedY = Math.max(5, Math.min(95, newY))

    setPosition({ x: clampedX, y: clampedY })
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      onUpdatePosition(textItem.id, position.x, position.y)
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const getPositionStyle = () => {
    return {
      top: `${position.y}%`,
      left: `${position.x}%`,
    }
  }

  const textStyle = {
    fontFamily: textItem.fontFamily,
    color: textItem.color,
    fontSize: `${textItem.fontSize}px`,
    textShadow:
      '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
    textAlign: 'center' as const,
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  }

  return (
    <div
      class={`absolute group select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        ...getPositionStyle(),
        transform: 'translate(-50%, -50%)',
      }}
      data-text-id={textItem.id}
      onMouseDown={handleMouseDown}
    >
      <div class='relative p-2'>
        <h1 style={textStyle}>
          {textItem.text}
        </h1>
        <button
          type='button'
          onClick={handleDeleteText}
          class='absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs'
          title='Delete text'
        >
          ×
        </button>
      </div>
    </div>
  )
}
