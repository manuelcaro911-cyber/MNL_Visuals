
import React, { useRef, useState, useEffect } from 'react';
import { 
  Eraser, Square, Circle, Minus, Trash2, X, PenTool, 
  Triangle, Palette, Save, Share2, 
  AlertTriangle, Check, RotateCcw, ChevronUp,
  Undo, Redo, Layers, Eye, EyeOff, MousePointer2,
  MoreHorizontal, Type, Image as ImageIcon, Hexagon, Star,
  Cloud, Heart, Zap, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Maximize, Minimize, Move, Crop, Copy, Scissors, ClipboardPaste,
  Search, ZoomIn, ZoomOut, Grid, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Link, Download, Upload, Settings, PaintBucket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { soundEngine } from '../lib/sounds';

interface WhiteboardProps {
  onClose: () => void;
  themeStyles: any;
  userRole: 'admin' | 'artist' | 'viewer';
  isBlocked?: boolean;
  whiteboardLink?: string;
  onUpdateWhiteboardLink?: (link: string) => void;
}

interface Shape {
  id: string;
  type: 'rect' | 'circle' | 'line' | 'triangle' | 'brush' | 'eraser' | 'star' | 'hexagon' | 'cloud' | 'heart' | 'arrow' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fillColor?: string;
  stroke: number;
  points?: {x: number, y: number}[];
  isMoving?: boolean;
  hidden?: boolean;
  text?: string;
  fontBold?: boolean;
  fontItalic?: boolean;
  fontUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

const Whiteboard: React.FC<WhiteboardProps> = ({ onClose, userRole, isBlocked, whiteboardLink, onUpdateWhiteboardLink }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [tool, setTool] = useState<Shape['type'] | 'select'>('brush');
  
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [activeShapeId, setActiveShapeId] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'colors' | 'layers'>('colors');
  const [showMoreTools, setShowMoreTools] = useState(false);
  
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const [colorHistory, setColorHistory] = useState<string[]>([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileTools, setShowMobileTools] = useState(false);
  const mobileToolsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInteraction = () => {
    if (!isMobile) return;
    setShowMobileTools(true);
    if (mobileToolsTimeoutRef.current) {
      clearTimeout(mobileToolsTimeoutRef.current);
    }
    mobileToolsTimeoutRef.current = setTimeout(() => {
      setShowMobileTools(false);
    }, 5000); // Reduced to 5 seconds for snappier feel
  };

  useEffect(() => {
    if (isMobile) {
      handleInteraction();
    }
    return () => {
      if (mobileToolsTimeoutRef.current) clearTimeout(mobileToolsTimeoutRef.current);
    }
  }, [isMobile]);

  useEffect(() => {
    if (color && !colorHistory.includes(color)) {
      setColorHistory(prev => [color, ...prev].slice(0, 10));
    }
  }, [color]);

  const [mode, setMode] = useState<'selection' | 'pixel' | 'normal'>('selection');
  const [pixelGridSize, setPixelGridSize] = useState(16);
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [published, setPublished] = useState<any[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [textPrompt, setTextPrompt] = useState<{ x: number, y: number } | null>(null);
  const [textInput, setTextInput] = useState("");
  const [clipboard, setClipboard] = useState<Shape | null>(null);
  const currentShapeRef = useRef<Shape | null>(null);
  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStartDist(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist - touchStartDist;
      setZoom(z => Math.min(Math.max(0.1, z + delta * 0.005), 5));
      setTouchStartDist(dist);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartDist(null);
  };

  const drawShape = (ctx: CanvasRenderingContext2D, s: Shape) => {
    if (mode === 'pixel' && s.type === 'pixel') {
      const cellWidth = ctx.canvas.width / pixelGridSize;
      const cellHeight = ctx.canvas.height / pixelGridSize;
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x * cellWidth, s.y * cellHeight, cellWidth, cellHeight);
      return;
    }

    ctx.beginPath();
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.stroke;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (s.isMoving) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#3b82f6';
    } else ctx.setLineDash([]);

    if (s.type === 'brush' || s.type === 'eraser') {
      if (s.points && s.points.length > 0) {
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (let i = 1; i < s.points.length - 1; i++) {
          const xc = (s.points[i].x + s.points[i + 1].x) / 2;
          const yc = (s.points[i].y + s.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(s.points[i].x, s.points[i].y, xc, yc);
        }
        if (s.points.length > 1) {
          ctx.lineTo(s.points[s.points.length - 1].x, s.points[s.points.length - 1].y);
        }
        ctx.stroke();
      }
    } else if (s.type === 'rect') {
      if (s.fillColor) {
        ctx.fillStyle = s.fillColor;
        ctx.fillRect(s.x, s.y, s.width, s.height);
      }
      ctx.strokeRect(s.x, s.y, s.width, s.height);
    } else if (s.type === 'circle') {
      const r = Math.sqrt(s.width**2 + s.height**2);
      ctx.arc(s.x, s.y, r, 0, 2*Math.PI);
      if (s.fillColor) {
        ctx.fillStyle = s.fillColor;
        ctx.fill();
      }
      ctx.stroke();
    } else if (s.type === 'line') {
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.width, s.y + s.height);
      ctx.stroke();
    } else if (s.type === 'triangle') {
      ctx.moveTo(s.x + s.width/2, s.y);
      ctx.lineTo(s.x, s.y + s.height);
      ctx.lineTo(s.x + s.width, s.y + s.height);
      ctx.closePath();
      if (s.fillColor) {
        ctx.fillStyle = s.fillColor;
        ctx.fill();
      }
      ctx.stroke();
    } else if (s.type === 'star') {
      const r = Math.sqrt(s.width**2 + s.height**2);
      drawStar(ctx, s.x, s.y, 5, r, r / 2);
      if (s.fillColor) {
        ctx.fillStyle = s.fillColor;
        ctx.fill();
      }
      ctx.stroke();
    } else if (s.type === 'hexagon') {
      const r = Math.sqrt(s.width**2 + s.height**2);
      drawHexagon(ctx, s.x, s.y, r);
      if (s.fillColor) {
        ctx.fillStyle = s.fillColor;
        ctx.fill();
      }
      ctx.stroke();
    } else if (s.type === 'heart') {
      drawHeart(ctx, s.x, s.y, s.width, s.height);
      if (s.fillColor) {
        ctx.fillStyle = s.fillColor;
        ctx.fill();
      }
      ctx.stroke();
    } else if (s.type === 'cloud') {
      drawCloud(ctx, s.x, s.y, s.width, s.height);
      if (s.fillColor) {
        ctx.fillStyle = s.fillColor;
        ctx.fill();
      }
      ctx.stroke();
    } else if (s.type === 'arrow') {
      const headlen = 20;
      const angle = Math.atan2(s.height, s.width);
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.width, s.y + s.height);
      ctx.lineTo(s.x + s.width - headlen * Math.cos(angle - Math.PI / 6), s.y + s.height - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(s.x + s.width, s.y + s.height);
      ctx.lineTo(s.x + s.width - headlen * Math.cos(angle + Math.PI / 6), s.y + s.height - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    } else if (s.type === 'text' && s.text) {
      const fontStyle = s.fontItalic ? 'italic ' : '';
      const fontWeight = s.fontBold ? 'bold ' : '';
      ctx.font = `${fontStyle}${fontWeight}${s.stroke * 4}px Inter`;
      ctx.fillStyle = s.color;
      ctx.textAlign = s.textAlign || 'left';
      ctx.fillText(s.text, s.x, s.y);
      
      if (s.fontUnderline) {
        const metrics = ctx.measureText(s.text);
        ctx.beginPath();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = Math.max(1, s.stroke / 2);
        let startX = s.x;
        if (ctx.textAlign === 'center') startX -= metrics.width / 2;
        if (ctx.textAlign === 'right') startX -= metrics.width;
        ctx.moveTo(startX, s.y + s.stroke);
        ctx.lineTo(startX + metrics.width, s.y + s.stroke);
        ctx.stroke();
      }
    } else if (s.type === 'image' && s.text) {
      if (imageCache.current[s.text]) {
        ctx.drawImage(imageCache.current[s.text], s.x, s.y, s.width, s.height);
      } else {
        const img = new Image();
        img.onload = () => {
          imageCache.current[s.text!] = img;
          renderCanvas();
        };
        img.src = s.text;
      }
    }
  };

  const canDraw = userRole === 'admin' || userRole === 'artist';

  const colorCategories = {
    "Grises/Negros": ['#000000', '#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888', '#999999', '#AAAAAA', '#BBBBBB', '#CCCCCC', '#DDDDDD', '#EEEEEE', '#FFFFFF'],
    "Rojos": ['#450a0a', '#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#fef2f2', '#ff0000', '#cc0000', '#990000', '#660000'],
    "Naranjas": ['#431407', '#7c2d12', '#9a3412', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#fff7ed', '#ff6600', '#cc5200', '#993d00', '#662900'],
    "Amarillos": ['#422006', '#713f12', '#854d0e', '#a16207', '#ca8a04', '#eab308', '#facc15', '#fde047', '#fef08a', '#fef9c3', '#fefce8', '#ffff00', '#cccc00', '#999900', '#666600'],
    "Verdes": ['#052e16', '#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#dcfce7', '#f0fdf4', '#00ff00', '#00cc00', '#009900', '#006600'],
    "Cianes": ['#083344', '#164e63', '#155e75', '#0e7490', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe', '#ecfeff', '#00ffff', '#00cccc', '#009999', '#006666'],
    "Azules": ['#172554', '#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff', '#0000ff', '#0000cc', '#000099', '#000066'],
    "Violetas": ['#2e1065', '#4c1d95', '#5b21b6', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff', '#8a2be2', '#9370db', '#ba55d3', '#da70d6'],
    "Rosas": ['#4a044e', '#701a75', '#86198f', '#a21caf', '#c026d3', '#d946ef', '#e879f9', '#f0abfc', '#fae8ff', '#fdf4ff', '#fff1f2', '#ff00ff', '#cc00cc', '#990099', '#660066'],
    "Marrones": ['#451a03', '#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7', '#fffbeb', '#fefce8', '#8b4513', '#a0522d', '#cd853f', '#d2b48c'],
    "Pasteles": ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e6e6fa', '#fff0f5', '#f0fff0', '#f0ffff', '#f5f5dc', '#ffe4e1', '#fafad2', '#e0ffff', '#ffe4b5', '#ffdab9']
  };

  const extraTools = [
    { id: 'star', icon: <Star className="w-5 h-5" />, label: 'Estrella' },
    { id: 'hexagon', icon: <Hexagon className="w-5 h-5" />, label: 'Hexágono' },
    { id: 'cloud', icon: <Cloud className="w-5 h-5" />, label: 'Nube' },
    { id: 'heart', icon: <Heart className="w-5 h-5" />, label: 'Corazón' },
    { id: 'arrow', icon: <ArrowRight className="w-5 h-5" />, label: 'Flecha' },
    { id: 'text', icon: <Type className="w-5 h-5" />, label: 'Texto' },
    { id: 'image', icon: <ImageIcon className="w-5 h-5" />, label: 'Imagen' },
    { id: 'grid', icon: <Grid className="w-5 h-5" />, label: 'Cuadrícula' },
    { id: 'copy', icon: <Copy className="w-5 h-5" />, label: 'Copiar' },
    { id: 'paste', icon: <ClipboardPaste className="w-5 h-5" />, label: 'Pegar' },
    { id: 'cut', icon: <Scissors className="w-5 h-5" />, label: 'Cortar' },
    { id: 'alignLeft', icon: <AlignLeft className="w-5 h-5" />, label: 'Izq' },
    { id: 'alignCenter', icon: <AlignCenter className="w-5 h-5" />, label: 'Centro' },
    { id: 'alignRight', icon: <AlignRight className="w-5 h-5" />, label: 'Der' },
    { id: 'bold', icon: <Bold className="w-5 h-5" />, label: 'Negrita' },
    { id: 'italic', icon: <Italic className="w-5 h-5" />, label: 'Cursiva' },
    { id: 'underline', icon: <Underline className="w-5 h-5" />, label: 'Subrayado' },
    { id: 'download', icon: <Download className="w-5 h-5" />, label: 'Descargar' },
  ];

  useEffect(() => {
    const fetchWorks = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { data: userDrawings } = await supabase
        .from('drawings')
        .select('*')
        .eq('author_id', user.id)
        .order('timestamp', { ascending: false });

      if (userDrawings) {
        setDrafts(userDrawings.filter(d => d.status === 'draft'));
        setPublished(userDrawings.filter(d => d.status === 'approved'));
      }
    };
    fetchWorks();

    const saved = localStorage.getItem('mnl_whiteboard_draft');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.shapes) {
        setShapes(data.shapes);
        setHistory([data.shapes]);
        setHistoryIndex(0);
      }
    }
  }, []);

  const commitAction = (newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setShapes(newShapes);
  };

  const undo = () => {
    if (historyIndex > 0) {
      soundEngine.play('click');
      setHistoryIndex(historyIndex - 1);
      setShapes(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      soundEngine.play('click');
      setHistoryIndex(historyIndex + 1);
      setShapes(history[historyIndex + 1]);
    }
  };

  const imageCache = useRef<{ [key: string]: HTMLImageElement }>({});

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    ctx.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0));
    for (let side = 0; side < 7; side++) {
      ctx.lineTo(x + radius * Math.cos(side * 2 * Math.PI / 6), y + radius * Math.sin(side * 2 * Math.PI / 6));
    }
  };

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    ctx.moveTo(x, y + height / 4);
    ctx.quadraticCurveTo(x, y, x + width / 4, y);
    ctx.quadraticCurveTo(x + width / 2, y, x + width / 2, y + height / 4);
    ctx.quadraticCurveTo(x + width / 2, y, x + width * 3/4, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + height / 4);
    ctx.quadraticCurveTo(x + width, y + height / 2, x + width / 2, y + height);
    ctx.quadraticCurveTo(x, y + height / 2, x, y + height / 4);
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    ctx.moveTo(x + width / 4, y + height / 2);
    ctx.bezierCurveTo(x, y + height / 2, x, y, x + width / 4, y);
    ctx.bezierCurveTo(x + width / 4, y - height / 4, x + width * 3/4, y - height / 4, x + width * 3/4, y);
    ctx.bezierCurveTo(x + width, y, x + width, y + height / 2, x + width * 3/4, y + height / 2);
    ctx.closePath();
  };

  const renderCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    if (mode === 'pixel') {
      // Draw pixel grid background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // Draw grid lines
      if (showGrid) {
        ctx.strokeStyle = '#e5e5e5';
        ctx.lineWidth = 1;
        
        const cellWidth = ctx.canvas.width / pixelGridSize;
        const cellHeight = ctx.canvas.height / pixelGridSize;
        
        for (let i = 0; i <= pixelGridSize; i++) {
          ctx.beginPath();
          ctx.moveTo(i * cellWidth, 0);
          ctx.lineTo(i * cellWidth, ctx.canvas.height);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(0, i * cellHeight);
          ctx.lineTo(ctx.canvas.width, i * cellHeight);
          ctx.stroke();
        }
      }
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      if (showGrid) {
        ctx.strokeStyle = '#e5e5e5';
        ctx.lineWidth = 1;
        const cellSize = 50; // default grid size for normal mode
        for (let x = 0; x <= ctx.canvas.width; x += cellSize) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ctx.canvas.height); ctx.stroke();
        }
        for (let y = 0; y <= ctx.canvas.height; y += cellSize) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ctx.canvas.width, y); ctx.stroke();
        }
      }
    }

    shapes.filter(s => !s.hidden).forEach(s => drawShape(ctx, s));
    
    if (currentShapeRef.current) {
      drawShape(ctx, currentShapeRef.current);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      // Set fixed canvas size relative to container or just fixed resolution
      canvas.width = mode === 'pixel' ? 1024 : 1600;
      canvas.height = mode === 'pixel' ? 1024 : 900;
    }
    renderCanvas();
  }, [shapes, mode, showGrid, pixelGridSize]);

  const getMousePos = (e: any) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    // Calculate scale since canvas might be scaled via CSS
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleDoubleClick = (e: any) => {
    if (!canDraw || tool !== 'select') return;
    const { x, y } = getMousePos(e);
    
    const found = [...shapes].reverse().find(s => {
      if (s.hidden || s.type !== 'text') return false;
      const minX = Math.min(s.x, s.x + s.width);
      const maxX = Math.max(s.x, s.x + s.width);
      const minY = Math.min(s.y, s.y + s.height);
      const maxY = Math.max(s.y, s.y + s.height);
      return x >= minX - 20 && x <= maxX + 20 && y >= minY - 20 && y <= maxY + 20;
    });

    if (found) {
      setTextPrompt({ x: found.x, y: found.y });
      setTextInput(found.text || "");
      setActiveShapeId(found.id);
    }
  };

  const handleMouseDown = (e: any) => {
    if (isMobile) setShowMobileTools(false);
    if (!canDraw) return;
    const { x, y } = getMousePos(e);
    
    if (tool === 'select') {
      const found = [...shapes].reverse().find(s => {
        if (s.hidden) return false;
        if (s.type === 'brush' || s.type === 'eraser') {
           if (!s.points) return false;
           const xs = s.points.map(p => p.x);
           const ys = s.points.map(p => p.y);
           const minX = Math.min(...xs), maxX = Math.max(...xs);
           const minY = Math.min(...ys), maxY = Math.max(...ys);
           return x >= minX - 10 && x <= maxX + 10 && y >= minY - 10 && y <= maxY + 10;
        }
        const minX = Math.min(s.x, s.x + s.width);
        const maxX = Math.max(s.x, s.x + s.width);
        const minY = Math.min(s.y, s.y + s.height);
        const maxY = Math.max(s.y, s.y + s.height);
        return x >= minX - 20 && x <= maxX + 20 && y >= minY - 20 && y <= maxY + 20;
      });

      if (found) {
        setShapes(prev => prev.map(s => 
          s.id === found.id ? { ...s, isMoving: true } : { ...s, isMoving: false }
        ));
        setStartX(x);
        setStartY(y);
        setIsDrawing(true);
      } else {
        setShapes(prev => prev.map(s => ({ ...s, isMoving: false })));
      }
      return;
    }

    if (tool === 'fill') {
      const found = [...shapes].reverse().find(s => {
        if (s.hidden) return false;
        if (s.type === 'brush' || s.type === 'eraser' || s.type === 'pixel' || s.type === 'line' || s.type === 'text' || s.type === 'image') return false;
        const minX = Math.min(s.x, s.x + s.width);
        const maxX = Math.max(s.x, s.x + s.width);
        const minY = Math.min(s.y, s.y + s.height);
        const maxY = Math.max(s.y, s.y + s.height);
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      });
      if (found) {
        const newShapes = shapes.map(s => s.id === found.id ? { ...s, fillColor: color } : s);
        setShapes(newShapes);
        commitAction(newShapes);
      }
      return;
    }

    if (tool === 'text') {
      setTextPrompt({ x, y });
      setTextInput("");
      return;
    }

    setStartX(x); setStartY(y);
    setIsDrawing(true);

    const newId = Math.random().toString(36).substr(2, 9);
    
    if (mode === 'pixel' && tool === 'brush') {
      const cellWidth = canvasRef.current!.width / pixelGridSize;
      const cellHeight = canvasRef.current!.height / pixelGridSize;
      const gridX = Math.floor(x / cellWidth);
      const gridY = Math.floor(y / cellHeight);
      
      const newShape: Shape = {
        id: newId, type: 'pixel' as any, x: gridX, y: gridY, width: 1, height: 1,
        color, stroke: 1
      };
      currentShapeRef.current = newShape;
      renderCanvas();
    } else if (tool === 'brush' || tool === 'eraser') {
      const newShape: Shape = {
        id: newId, type: tool, x, y, width: 0, height: 0,
        color: tool === 'eraser' ? '#ffffff' : color,
        stroke: tool === 'eraser' ? brushSize * 2 : brushSize, 
        points: [{x, y}]
      };
      currentShapeRef.current = newShape;
      renderCanvas();
    } else {
      const newShape: Shape = { id: newId, type: tool as any, x, y, width: 0, height: 0, color, stroke: brushSize };
      currentShapeRef.current = newShape;
      renderCanvas();
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const { x, y } = getMousePos(e);

    if (tool === 'select') {
      const moving = shapes.find(s => s.isMoving);
      if (moving) {
        const dx = x - startX;
        const dy = y - startY;
        setShapes(prev => prev.map(s => {
          if (s.id === moving.id) {
            if ((s.type === 'brush' || s.type === 'eraser') && s.points) {
              return { ...s, points: s.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
            }
            return { ...s, x: s.x + dx, y: s.y + dy };
          }
          return s;
        }));
        setStartX(x);
        setStartY(y);
      }
      return;
    }

    if (!currentShapeRef.current) return;

    if (mode === 'pixel' && tool === 'brush') {
      const cellWidth = canvasRef.current!.width / pixelGridSize;
      const cellHeight = canvasRef.current!.height / pixelGridSize;
      const gridX = Math.floor(x / cellWidth);
      const gridY = Math.floor(y / cellHeight);
      
      // Only add if we moved to a new cell
      if (currentShapeRef.current.x !== gridX || currentShapeRef.current.y !== gridY) {
        const newId = Math.random().toString(36).substr(2, 9);
        const newPixel: Shape = {
          id: newId, type: 'pixel' as any, x: gridX, y: gridY, width: 1, height: 1,
          color, stroke: 1
        };
        // For pixel mode, we actually need to append to shapes to keep the trail
        setShapes(prev => [...prev, newPixel]);
      }
    } else if (tool === 'brush' || tool === 'eraser') {
      const points = currentShapeRef.current.points || [];
      const lastPoint = points[points.length - 1];
      if (!lastPoint || Math.hypot(lastPoint.x - x, lastPoint.y - y) > 3) {
        currentShapeRef.current = {
          ...currentShapeRef.current,
          points: [...points, {x, y}]
        };
        renderCanvas();
      }
    } else {
      currentShapeRef.current = {
        ...currentShapeRef.current,
        width: x - startX,
        height: y - startY
      };
      renderCanvas();
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (tool === 'select') {
        setShapes(prev => prev.map(s => ({ ...s, isMoving: false })));
        commitAction(shapes);
      } else if (currentShapeRef.current) {
        const newShapes = [...shapes, currentShapeRef.current];
        setShapes(newShapes);
        currentShapeRef.current = null;
        commitAction(newShapes);
      }
    }
  };

  const saveDraft = async () => {
    localStorage.setItem('mnl_whiteboard_draft', JSON.stringify({ shapes }));
    
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (user) {
      const dataUrl = canvasRef.current?.toDataURL('image/png');
      const draftData = {
        author: user?.user_metadata?.username || 'Invitado',
        author_id: user.id,
        image_url: dataUrl,
        description: "Borrador - Whiteboard",
        status: 'draft',
        timestamp: Date.now(),
        data: { shapes, pixelGridSize, mode }
      };

      if (currentDraftId) {
        await supabase.from('drawings').update(draftData).eq('id', currentDraftId);
        alert("Borrador actualizado en la nube.");
      } else {
        const { data, error } = await supabase.from('drawings').insert([draftData]).select();
        if (data && data.length > 0) {
          setCurrentDraftId(data[0].id);
          alert("Borrador guardado en la nube.");
        }
      }
    } else {
      alert("Borrador guardado localmente (inicia sesión para guardar en la nube).");
    }
    setShowExitConfirm(false);
  };

  const publishToCommunity = async () => {
    if (isBlocked) {
      alert("Tu cuenta ha sido bloqueada. No puedes publicar obras.");
      return;
    }
    setIsPublishing(true);
    const dataUrl = canvasRef.current?.toDataURL('image/png');
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user || !dataUrl) {
      setIsPublishing(false);
      return;
    }

    try {
      // Convert base64 to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileExt = 'png';
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('drawings').upload(filePath, blob);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('drawings').getPublicUrl(filePath);

      const drawingData = {
        author: user.user_metadata?.username || 'Invitado',
        author_id: user.id,
        image_url: publicUrl,
        description: "Obra finalizada - Whiteboard",
        status: userRole === 'admin' ? 'approved' : 'pending',
        timestamp: Date.now(),
        data: { shapes, pixelGridSize, mode }
      };

      if (currentDraftId) {
        await supabase.from('drawings').update(drawingData).eq('id', currentDraftId);
      } else {
        await supabase.from('drawings').insert([drawingData]);
      }
      
      setIsPublishing(false); 
      setShowUploadWarning(false); 
      setShowExitConfirm(false);
      localStorage.removeItem('mnl_whiteboard_draft');
      
      if (userRole !== 'admin') {
        setShowPendingMessage(true);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error publishing:", error);
      alert("Error al publicar la obra.");
      setIsPublishing(false);
    }
  };

  const toggleLayerVisibility = (id: string) => {
    const newShapes = shapes.map(s => s.id === id ? { ...s, hidden: !s.hidden } : s);
    commitAction(newShapes);
  };

  const deleteLayer = (id: string) => {
    const newShapes = shapes.filter(s => s.id !== id);
    commitAction(newShapes);
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearCanvas = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCanvas = () => {
    commitAction([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-neutral-950 overflow-hidden h-full w-full select-none flex flex-col">
      {mode === 'selection' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-white overflow-hidden">
          {/* Landscape Silhouette */}
          <div className="absolute bottom-0 left-0 w-full pointer-events-none opacity-10">
            <svg viewBox="0 0 1440 320" fill="black" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,186.7C840,171,960,117,1080,112C1200,107,1320,149,1380,170.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
              <path d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fillOpacity="0.5"></path>
            </svg>
          </div>

          <div className="absolute top-8 right-8 z-50">
            <button onClick={onClose} className="p-3 bg-black/5 hover:bg-black/10 text-black rounded-xl transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex gap-8 mb-16 relative z-10 mt-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShapes([]);
                setHistory([[]]);
                setHistoryIndex(0);
                setCurrentDraftId(null);
                setMode('pixel');
                setShowGrid(true);
              }}
              className="w-72 h-80 bg-white/40 backdrop-blur-2xl border border-black/10 rounded-[3rem] p-8 flex flex-col items-center justify-center gap-6 group hover:border-blue-500/50 transition-all shadow-2xl"
            >
              <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                <Grid className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-black uppercase tracking-widest mb-2">Pixel Art</h3>
                <p className="text-xs text-black/40 font-medium">Lienzo cuadriculado para arte pixelado.</p>
              </div>
              <div className="w-full mt-4" onClick={(e) => e.stopPropagation()}>
                <label className="text-xs font-black text-black/40 uppercase tracking-widest block mb-2 text-center">Tamaño de cuadrícula</label>
                <input 
                  type="range" 
                  min="8" 
                  max="64" 
                  step="8"
                  value={pixelGridSize} 
                  onChange={(e) => setPixelGridSize(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="text-center mt-2 text-sm font-mono text-black/60">{pixelGridSize}x{pixelGridSize}</div>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShapes([]);
                setHistory([[]]);
                setHistoryIndex(0);
                setCurrentDraftId(null);
                setMode('normal');
                setShowGrid(false);
              }}
              className="w-72 h-80 bg-white/40 backdrop-blur-2xl border border-black/10 rounded-[3rem] p-8 flex flex-col items-center justify-center gap-6 group hover:border-blue-500/50 transition-all shadow-2xl"
            >
              <div className="w-24 h-24 bg-black/5 rounded-3xl flex items-center justify-center group-hover:bg-black/10 transition-all">
                <Square className="w-12 h-12 text-black" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-black uppercase tracking-widest mb-2">Normal</h3>
                <p className="text-xs text-black/40 font-medium">Lienzo en blanco clásico para dibujo libre.</p>
              </div>
            </motion.button>
          </div>

          {/* Drafts at the bottom */}
          <div className="w-full max-w-4xl relative z-10 mt-auto mb-8">
            <div className="flex items-center justify-between mb-4 px-4">
              <h3 className="text-sm font-black text-black uppercase tracking-widest">Tus Borradores</h3>
            </div>
            
            <div className="bg-white/40 backdrop-blur-2xl border border-black/10 rounded-[2rem] p-6 shadow-xl min-h-[160px] flex items-center">
              {drafts.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2 w-full">
                  {drafts.map(draft => (
                    <div 
                      key={draft.id} 
                      onClick={() => {
                        if (draft.data) {
                          setShapes(draft.data.shapes || []);
                          setHistory([draft.data.shapes || []]);
                          setHistoryIndex(0);
                          setPixelGridSize(draft.data.pixelGridSize || 16);
                          setMode(draft.data.mode || 'normal');
                          setCurrentDraftId(draft.id);
                        }
                      }}
                      className="group relative w-48 h-32 flex-shrink-0 bg-neutral-100 rounded-xl overflow-hidden cursor-pointer border border-black/5 hover:border-blue-500/50 transition-all shadow-md"
                    >
                      {draft.image_url && <img src={draft.image_url} alt="Draft" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />}
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-black text-black uppercase tracking-widest">Continuar</span>
                      </div>
                      {draft.rejection_reason && (
                        <div className="absolute top-2 left-2 right-2 bg-red-600 border border-red-500 rounded p-1 shadow-xl flex items-center justify-center overflow-hidden" title={draft.rejection_reason}>
                           <AlertTriangle className="w-3 h-3 text-white mr-1 shrink-0" />
                           <span className="text-[8px] font-black uppercase text-white truncate max-w-full">Rechazado</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center text-center opacity-40 py-4">
                  <Save className="w-8 h-8 mb-2 text-black" />
                  <p className="text-xs font-black uppercase tracking-widest text-black">Aún nada</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header Personalizado MNL */}
          <div className="w-full z-[150] flex items-center justify-between px-4 md:px-8 py-4 bg-neutral-900/80 backdrop-blur-xl border-b border-white/10 shadow-2xl overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-4 md:gap-6 shrink-0">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Visual_Lab</h2>
                <p className="text-[8px] font-black opacity-40 text-white uppercase tracking-[0.2em]">Master Whiteboard Experiment - {mode === 'pixel' ? 'Pixel Mode' : 'Normal Mode'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-4 md:ml-0">
              {userRole === 'admin' && (
                <button onClick={() => { setLinkInput(whiteboardLink || ""); setShowLinkPrompt(true); }} className="px-6 py-2.5 bg-purple-600/20 border border-purple-500/50 rounded-xl text-[9px] text-purple-400 uppercase font-black tracking-widest hover:text-white hover:bg-purple-600 transition-all">
                  <Link className="w-3 h-3 inline mr-2" /> Link Admin
                </button>
              )}
              <button onClick={() => setMode('selection')} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] text-white/60 uppercase font-black tracking-widest hover:text-white hover:bg-white/10 transition-all">
                <ArrowLeft className="w-3 h-3 inline mr-2" /> Cambiar Modo
              </button>
              <button onClick={saveDraft} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] text-white/60 uppercase font-black tracking-widest hover:text-white hover:bg-white/10 transition-all">
                <Save className="w-3 h-3 inline mr-2" /> Respaldar
              </button>
              <button onClick={() => setShowUploadWarning(true)} className="px-6 py-2.5 bg-blue-600 rounded-xl text-[9px] text-white uppercase font-black tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
                <Share2 className="w-3 h-3 inline mr-2" /> Lanzar Obra
              </button>
              <div className="w-[1px] h-6 bg-white/10 mx-2" />
              <button onClick={() => setShowExitConfirm(true)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

      <div className="flex-1 flex overflow-hidden relative">
        {isMobile && !showMobileTools && (
          <button 
            onClick={handleInteraction}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-blue-600 text-white p-4 rounded-full shadow-[0_10px_40px_rgba(59,130,246,0.6)] animate-bounce"
          >
            <Palette className="w-6 h-6" />
          </button>
        )}

        {/* Top Left - Advanced Tools */}
        {(!isMobile || showMobileTools) && (
          <div className="absolute left-6 top-6 z-[200]" onPointerDown={handleInteraction}>
            <div className="relative">
              <button 
                onClick={() => setShowMoreTools(!showMoreTools)} 
                className={`p-4 rounded-2xl transition-all flex items-center gap-3 group relative shadow-[0_10px_30px_rgba(0,0,0,0.3)] ${showMoreTools ? 'bg-blue-600 text-white scale-105' : 'bg-neutral-900/90 backdrop-blur-2xl border border-white/10 text-white/60 hover:text-white hover:scale-105'}`}
              >
                <MoreHorizontal className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Avanzadas</span>
              </button>

              <AnimatePresence>
                {showMoreTools && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-0 top-full mt-4 w-[300px] md:w-[420px] bg-neutral-900/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 z-[200]"
                  >
                  <div className="col-span-4 mb-2">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Herramientas Avanzadas</h4>
                  </div>
                  {extraTools.map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => {
                        if (['star', 'hexagon', 'cloud', 'heart', 'arrow', 'text', 'triangle'].includes(t.id)) {
                          setTool(t.id as any);
                        } else if (t.id === 'image') {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const dataUrl = event.target?.result as string;
                                const newId = Math.random().toString(36).substr(2, 9);
                                const img = new Image();
                                img.onload = () => {
                                  const newShape: Shape = {
                                    id: newId,
                                    type: 'image' as any,
                                    x: 100,
                                    y: 100,
                                    width: img.width > 300 ? 300 : img.width,
                                    height: img.width > 300 ? (img.height * 300 / img.width) : img.height,
                                    color: 'transparent',
                                    stroke: 0,
                                    text: dataUrl
                                  };
                                  const newShapes = [...shapes, newShape];
                                  setShapes(newShapes);
                                  commitAction(newShapes);
                                };
                                img.src = dataUrl;
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        } else if (t.id === 'zoomIn') {
                          setZoom(prev => Math.min(prev + 0.2, 5));
                        } else if (t.id === 'zoomOut') {
                          setZoom(prev => Math.max(prev - 0.2, 0.1));
                        } else if (t.id === 'grid') {
                          setShowGrid(prev => !prev);
                        } else if (['bold', 'italic', 'underline', 'alignLeft', 'alignCenter', 'alignRight'].includes(t.id)) {
                          if (activeShapeId) {
                            setShapes(prev => {
                              const newShapes = prev.map(s => {
                                if (s.id === activeShapeId && s.type === 'text') {
                                  if (t.id === 'bold') return { ...s, fontBold: !s.fontBold };
                                  if (t.id === 'italic') return { ...s, fontItalic: !s.fontItalic };
                                  if (t.id === 'underline') return { ...s, fontUnderline: !s.fontUnderline };
                                  if (t.id === 'alignLeft') return { ...s, textAlign: 'left' };
                                  if (t.id === 'alignCenter') return { ...s, textAlign: 'center' };
                                  if (t.id === 'alignRight') return { ...s, textAlign: 'right' };
                                }
                                return s;
                              });
                              commitAction(newShapes);
                              return newShapes;
                            });
                          }
                        } else if (t.id === 'copy') {
                          if (activeShapeId) {
                            const shape = shapes.find(s => s.id === activeShapeId);
                            if (shape) setClipboard(shape);
                          }
                        } else if (t.id === 'cut') {
                          if (activeShapeId) {
                            const shape = shapes.find(s => s.id === activeShapeId);
                            if (shape) {
                              setClipboard(shape);
                              const newShapes = shapes.filter(s => s.id !== activeShapeId);
                              setShapes(newShapes);
                              commitAction(newShapes);
                              setActiveShapeId(null);
                            }
                          }
                        } else if (t.id === 'paste') {
                          if (clipboard) {
                            const newId = Math.random().toString(36).substr(2, 9);
                            const newShape = { ...clipboard, id: newId, x: clipboard.x + 20, y: clipboard.y + 20 };
                            const newShapes = [...shapes, newShape];
                            setShapes(newShapes);
                            commitAction(newShapes);
                            setActiveShapeId(newId);
                          }
                        } else if (t.id === 'download') {
                          const dataUrl = canvasRef.current?.toDataURL('image/png');
                          if (dataUrl) {
                            const a = document.createElement('a');
                            a.href = dataUrl;
                            a.download = 'whiteboard.png';
                            a.click();
                          }
                        }
                        setShowMoreTools(false);
                      }} 
                      className={`p-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-3 ${tool === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:scale-105'}`}
                      title={t.label}
                    >
                      {React.cloneElement(t.icon as React.ReactElement, { className: 'w-7 h-7' })}
                      <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{t.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        )}

        {/* Left Sidebar - Floating Tools Dock */}
        <AnimatePresence>
          {(!isMobile || showMobileTools) && (
            <motion.div 
              initial={isMobile ? { opacity: 0, x: -20 } : false}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute left-6 top-24 bottom-6 z-[200] flex flex-col gap-4" 
              onPointerDown={handleInteraction}
            >
            <div className="w-20 bg-neutral-900/95 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] flex flex-col items-center py-6 gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-y-auto">
              <div className="flex flex-col gap-2 w-full px-3 shrink-0">
                <button onClick={undo} disabled={historyIndex === 0} className="p-3 rounded-2xl text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all flex flex-col items-center gap-1 group relative">
                  <Undo className="w-6 h-6" />
                  <div className="absolute left-full ml-4 px-3 py-2 bg-neutral-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">Deshacer</div>
                </button>
                <button onClick={redo} disabled={historyIndex === history.length - 1} className="p-3 rounded-2xl text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all flex flex-col items-center gap-1 group relative">
                  <Redo className="w-6 h-6" />
                  <div className="absolute left-full ml-4 px-3 py-2 bg-neutral-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">Rehacer</div>
                </button>
              </div>

              <div className="w-8 h-[1px] bg-white/10" />

              <div className="flex flex-col gap-2 w-full px-3">
                {[
                  { id: 'select', icon: <MousePointer2 className="w-6 h-6" />, label: 'Mover' },
                  { id: 'brush', icon: <PenTool className="w-6 h-6" />, label: 'Pincel' },
                  { id: 'eraser', icon: <Eraser className="w-6 h-6" />, label: 'Goma' },
                  { id: 'fill', icon: <PaintBucket className="w-6 h-6" />, label: 'Relleno' },
                  { id: 'line', icon: <Minus className="w-6 h-6" />, label: 'Línea' },
                  { id: 'rect', icon: <Square className="w-6 h-6" />, label: 'Cuadro' },
                  { id: 'circle', icon: <Circle className="w-6 h-6" />, label: 'Círculo' }
                ].map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setTool(t.id as any)} 
                    className={`p-3 rounded-2xl transition-all flex flex-col items-center gap-1.5 relative group ${tool === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-110' : 'text-white/40 hover:bg-white/10 hover:text-white hover:scale-105'}`}
                  >
                    {t.icon}
                    <div className="absolute left-full ml-4 px-3 py-2 bg-neutral-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                      {t.label}
                    </div>
                  </button>
                ))}
              </div>

              {mode === 'pixel' && (
                <>
                  <div className="w-8 h-[1px] bg-white/10" />
                  <div className="flex flex-col gap-3 w-full px-4 items-center">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest text-center">Cuadrícula</span>
                    <input 
                      type="range" min="8" max="64" step="8"
                      value={pixelGridSize} 
                      onChange={e => setPixelGridSize(parseInt(e.target.value))} 
                      className="w-full h-1.5 appearance-none bg-white/10 rounded-full accent-blue-500" 
                    />
                    <span className="text-[10px] font-mono text-white/60">{pixelGridSize}x{pixelGridSize}</span>
                  </div>
                </>
              )}

              <div className="w-8 h-[1px] bg-white/10" />

              <button onClick={clearCanvas} className="p-3 rounded-2xl text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all flex flex-col items-center gap-1 group relative">
                <Trash2 className="w-6 h-6" />
                <div className="absolute left-full ml-4 px-3 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">Limpiar</div>
              </button>
            </div>
          </motion.div>
          )}
        </AnimatePresence>

        {/* Center - Canvas Container */}
        <div 
          className="flex-1 bg-neutral-950 relative overflow-auto flex items-center justify-center p-8 md:pl-32 md:pr-80" 
          ref={containerRef}
          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
              setZoom(z => Math.min(Math.max(0.1, z + zoomDelta), 5));
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Canvas Wrapper with fixed aspect ratio / size */}
          <div 
            className="relative bg-white shadow-[0_0_60px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden transition-transform duration-200" 
            style={{ 
              width: mode === 'pixel' ? '1024px' : '1600px', 
              height: mode === 'pixel' ? '1024px' : '900px', 
              maxWidth: '100%', 
              maxHeight: '100%', 
              aspectRatio: mode === 'pixel' ? '1/1' : '16/9',
              transform: `scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            <canvas 
              ref={canvasRef} 
              onMouseDown={handleMouseDown} 
              onMouseMove={handleMouseMove} 
              onMouseUp={handleMouseUp} 
              onMouseLeave={handleMouseUp}
              onDoubleClick={handleDoubleClick}
              className={`w-full h-full absolute inset-0 z-10 ${tool === 'select' ? 'cursor-move' : 'cursor-crosshair'}`} 
            />

            {whiteboardLink && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                <motion.a
                  href={whiteboardLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group flex items-center justify-center p-[4px] rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  {/* Dynamic border effect */}
                  <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(0,0,0,1)_360deg)] animate-spin opacity-100" style={{ animationDuration: '4s' }} />
                  <div className="absolute inset-[-100%] bg-[conic-gradient(from_180deg,transparent_0_340deg,rgba(59,130,246,1)_360deg)] animate-spin opacity-100" style={{ animationDuration: '4s' }} />
                  
                  {/* Inner blur and background */}
                  <div className="relative flex items-center gap-4 px-10 py-5 bg-black/40 backdrop-blur-2xl rounded-full border border-white/20 w-full h-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Link className="w-6 h-6 text-white relative z-10" />
                    <span className="text-white font-black uppercase tracking-widest text-base relative z-10 drop-shadow-md">Enlace Destacado</span>
                  </div>
                </motion.a>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Floating Colors & Layers Dock */}
        <AnimatePresence>
          {(!isMobile || showMobileTools) && (
            <motion.div 
              initial={isMobile ? { opacity: 0, x: 20 } : false}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute right-6 top-24 bottom-6 z-[200] flex flex-col gap-4" 
              onPointerDown={handleInteraction}
            >
            <div className="w-64 h-full bg-neutral-900/95 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="flex border-b border-white/10 p-2 gap-2 shrink-0">
                <button 
                  onClick={() => setRightPanelTab('colors')}
                  className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${rightPanelTab === 'colors' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  Colores
                </button>
                <button 
                  onClick={() => setRightPanelTab('layers')}
                  className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${rightPanelTab === 'layers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  Capas ({shapes.length})
                </button>
              </div>

            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {rightPanelTab === 'colors' ? (
                  <motion.div key="colors" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase text-white/30 tracking-widest border-b border-white/5 pb-2 italic">Grosor de Pincel</h4>
                      <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10">
                        <input 
                          type="range" min="1" max="50" 
                          value={brushSize} 
                          onChange={e => setBrushSize(parseInt(e.target.value))} 
                          className="w-full h-1.5 appearance-none bg-white/10 rounded-full accent-blue-500" 
                        />
                        <span className="text-xs font-mono text-white/60 w-8 text-right">{brushSize}px</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase text-white/30 tracking-widest border-b border-white/5 pb-2 italic">Color Personalizado</h4>
                      <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10">
                        <input 
                          type="color" 
                          value={color} 
                          onChange={(e) => setColor(e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                        />
                        <input 
                          type="text" 
                          value={color} 
                          onChange={(e) => setColor(e.target.value)}
                          className="flex-1 bg-transparent border-none text-white font-mono text-xs focus:outline-none uppercase"
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>

                    {colorHistory.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[9px] font-black uppercase text-white/30 tracking-widest border-b border-white/5 pb-2 italic">Historial</h4>
                        <div className="flex flex-wrap gap-2">
                          {colorHistory.map((c, i) => (
                            <button 
                              key={`hist-${c}-${i}`} 
                              onClick={() => setColor(c)} 
                              className={`w-10 h-10 rounded-xl border-2 transition-all shadow-md ${color === c ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-110'}`} 
                              style={{ backgroundColor: c }} 
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {Object.entries(colorCategories).map(([name, colors]) => (
                      <div key={name} className="space-y-3">
                        <h4 className="text-[9px] font-black uppercase text-white/30 tracking-widest border-b border-white/5 pb-2 italic">{name}</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {colors.map(c => (
                            <button 
                              key={c} 
                              onClick={() => setColor(c)} 
                              className={`aspect-square rounded-xl border-2 transition-all shadow-md ${color === c ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-110'}`} 
                              style={{ backgroundColor: c }} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="layers" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
                    {shapes.length === 0 ? (
                      <div className="text-center py-10 opacity-30">
                        <Layers className="w-10 h-10 mx-auto mb-4" />
                        <p className="text-[9px] font-black uppercase tracking-widest">Sin capas</p>
                      </div>
                    ) : (
                      [...shapes].reverse().map((s, i) => (
                        <div key={s.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${activeShapeId === s.id ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                          <div className="flex items-center gap-4">
                            <div className="w-5 h-5 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: s.type === 'eraser' ? '#fff' : s.color }} />
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                                {s.type === 'brush' ? 'Trazo' : s.type === 'eraser' ? 'Borrador' : s.type}
                              </p>
                              <p className="text-[8px] font-mono text-white/40">Capa {shapes.length - i}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleLayerVisibility(s.id)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                              {s.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button onClick={() => deleteLayer(s.id)} className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
      </div>

      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/60 backdrop-blur-xl p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-neutral-900 p-12 rounded-[4rem] text-center space-y-8 max-w-sm border border-white/10 shadow-3xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">¿Limpiar todo el lienzo?</h3>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={confirmClearCanvas} 
                  className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all"
                >
                  Sí, Limpiar
                </button>
                <button 
                  onClick={() => setShowClearConfirm(false)} 
                  className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/60 backdrop-blur-xl p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-neutral-900 p-12 rounded-[4rem] text-center space-y-8 max-w-sm border border-white/10 shadow-3xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">¿Deseas salir sin guardar?</h3>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { localStorage.removeItem('mnl_whiteboard_draft'); onClose(); }} 
                  className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all"
                >
                  Sí, Salir y Borrar
                </button>
                <button 
                  onClick={() => { setShowExitConfirm(false); }} 
                  className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                >
                  No, Prefiero Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Advertencia Lanzamiento Comunidad */}
      <AnimatePresence>
        {showUploadWarning && (
          <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/60 backdrop-blur-xl p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-neutral-900 p-12 rounded-[4rem] text-center space-y-8 max-w-md border border-white/10 shadow-3xl"
            >
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
                <Share2 className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Protocolo_Lanzamiento</h3>
              <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20 text-left">
                <p className="text-[11px] font-black text-red-500 uppercase tracking-widest italic leading-relaxed">⚠️ AVISO: Una vez lanzado a la comunidad, el dibujo NO se podrá editar. Solo el Super Admin podrá eliminarlo.</p>
              </div>
              <button 
                onClick={publishToCommunity} 
                disabled={isPublishing}
                className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-3 shadow-2xl hover:bg-white hover:text-black transition-all"
              >
                {isPublishing ? <RotateCcw className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />} 
                Lanzar Obra Final
              </button>
              <button onClick={() => setShowUploadWarning(false)} className="w-full py-5 text-white/30 font-black uppercase text-[9px] tracking-widest hover:text-white transition-all">Cancelar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pending Message Modal */}
      <AnimatePresence>
        {showPendingMessage && (
          <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/60 backdrop-blur-xl p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 p-12 rounded-[4rem] text-center space-y-8 max-w-md border border-white/10 shadow-3xl"
            >
               <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
                 <Check className="w-10 h-10 text-blue-500" />
               </div>
               <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Obra en Revisión</h3>
               <p className="text-white/60 text-sm leading-relaxed">
                 Tu obra ha sido enviada exitosamente y actualmente se encuentra en estado <strong className="text-white">Pendiente</strong>. 
                 Un administrador revisará tu dibujo para asegurarse de que cumple con nuestras políticas antes de ser aprobado y publicado en la galería comunitaria, o denegado si incumple las normas. 
                 ¡Gracias por compartir tu arte con nosotros!
               </p>
               <button onClick={onClose} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all">
                 Entendido
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Text Prompt Modal */}
      <AnimatePresence>
        {showLinkPrompt && (
          <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/60 backdrop-blur-xl p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 p-8 rounded-3xl text-center space-y-6 max-w-sm border border-white/10 shadow-3xl"
            >
              <h3 className="text-lg font-black text-white uppercase tracking-widest">Link Destacado</h3>
              <input 
                type="text" 
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onUpdateWhiteboardLink?.(linkInput);
                    setShowLinkPrompt(false);
                  } else if (e.key === 'Escape') {
                    setShowLinkPrompt(false);
                  }
                }}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="https://..."
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowLinkPrompt(false)}
                  className="flex-1 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    onUpdateWhiteboardLink?.(linkInput);
                    setShowLinkPrompt(false);
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all text-xs font-black uppercase tracking-widest"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom - Stroke Width Slider */}


      {/* Text Prompt Modal */}
      <AnimatePresence>
        {textPrompt && (
          <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/60 backdrop-blur-xl p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 p-8 rounded-3xl text-center space-y-6 max-w-sm border border-white/10 shadow-3xl"
            >
              <h3 className="text-lg font-black text-white uppercase tracking-widest">Añadir Texto</h3>
              <input 
                type="text" 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && textInput.trim()) {
                    if (activeShapeId) {
                      const newShapes = shapes.map(s => s.id === activeShapeId ? { ...s, text: textInput } : s);
                      commitAction(newShapes);
                    } else {
                      const newId = Math.random().toString(36).substr(2, 9);
                      const newShape: Shape = {
                        id: newId, type: 'text', x: textPrompt.x, y: textPrompt.y, width: 0, height: 0,
                        color, stroke: brushSize, text: textInput
                      };
                      commitAction([...shapes, newShape]);
                    }
                    setTextPrompt(null);
                  } else if (e.key === 'Escape') {
                    setTextPrompt(null);
                  }
                }}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Escribe aquí..."
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setTextPrompt(null)}
                  className="flex-1 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (textInput.trim()) {
                      if (activeShapeId) {
                        const newShapes = shapes.map(s => s.id === activeShapeId ? { ...s, text: textInput } : s);
                        commitAction(newShapes);
                      } else {
                        const newId = Math.random().toString(36).substr(2, 9);
                        const newShape: Shape = {
                          id: newId, type: 'text', x: textPrompt.x, y: textPrompt.y, width: 0, height: 0,
                          color, stroke: brushSize, text: textInput
                        };
                        commitAction([...shapes, newShape]);
                      }
                      setTextPrompt(null);
                    }
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all text-xs font-black uppercase tracking-widest"
                >
                  Añadir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default Whiteboard;
