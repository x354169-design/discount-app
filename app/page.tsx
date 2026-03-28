'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Firebaseの鍵を読み込む

const MapComponent = dynamic(() => import('../components/Map'), { ssr: false });

const categories = [
  { id: 'meat', name: '肉', icon: '🥩' },
  { id: 'fish', name: '魚', icon: '🐟' },
  { id: 'bento', name: 'お惣菜・弁当', icon: '🍱' },
  { id: 'bread', name: 'パン・日配品', icon: '🍞' }
];
const discounts = ['10% OFF', '20% OFF', '30% OFF', '半額！！！'];

export default function DiscountApp() {
  const [activeTab, setActiveTab] = useState('feed')
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPostIds, setLikedPostIds] = useState([]);

  const [step, setStep] = useState(1);
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState('');
  const [selectedCoords, setSelectedCoords] = useState<any>(null);

  // 1. Firebaseからリアルタイムで投稿を取得する
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postData);
    });
    return () => unsubscribe();
  }, []);

  // 2. 投稿をFirebaseに保存する
  const handlePost = async () => {
    try {
      await addDoc(collection(db, 'posts'), {
        store: selectedStore,
        category: selectedCategory,
        discount: selectedDiscount,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        likes: 0,
        createdAt: new Date(),
        // 🌟 複雑な座標データから、数字だけを抜き出して保存！
        coords: selectedCoords ? { lat: selectedCoords.lat, lng: selectedCoords.lng } : null
      });

      // 成功したら画面をリセット
      setStep(1);
      setSelectedStation('');
      setSelectedStore('');
      setSelectedCategory('');
      setSelectedDiscount('');
      setSelectedCoords(null);
      setActiveTab('feed'); 
    } catch (error) {
      console.error("投稿エラー: ", error);
      alert("投稿に失敗しました😭 コンソールを確認してな！");
    }
  };

  // 3. いいね機能（Firebaseのデータを更新）
  const toggleLike = async (postId, currentLikes) => {
    const postRef = doc(db, 'posts', postId);
    const isLiked = likedPostIds.includes(postId);

    if (isLiked) {
      await updateDoc(postRef, { likes: currentLikes - 1 });
      setLikedPostIds(likedPostIds.filter(id => id !== postId));
    } else {
      await updateDoc(postRef, { likes: currentLikes + 1 });
      setLikedPostIds([...likedPostIds, postId]);
    }
  };

  const goToNextStep = (setter, value) => {
    setter(value);
    setStep((prev) => prev + 1);
  };

  // --- スタイル ---
  const buttonStyle = {
    display: 'block', width: '100%', padding: '15px', marginBottom: '10px',
    backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '10px',
    fontSize: '18px', textAlign: 'left', cursor: 'pointer',
    color: '#333333', WebkitTextFillColor: '#333333', fontWeight: 'bold'
  };

  const titleStyle = { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', color: '#ffffff' };
  const h2Style = { fontSize: '18px', marginBottom: '15px', color: '#ffffff' };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff' }}>
      <h1 style={titleStyle}>🛒 見切り品ハンター</h1>

      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #444' }}>
        <button onClick={() => setActiveTab('feed')} style={{ flex: 1, padding: '10px', fontWeight: 'bold', color: activeTab === 'feed' ? '#ff4757' : '#ffffff', borderBottom: activeTab === 'feed' ? '3px solid #ff4757' : 'none', backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer' }}>📱 みんなの投稿</button>
        <button onClick={() => setActiveTab('post')} style={{ flex: 1, padding: '10px', fontWeight: 'bold', color: activeTab === 'post' ? '#ff4757' : '#ffffff', borderBottom: activeTab === 'post' ? '3px solid #ff4757' : 'none', backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer' }}>✍️ 投稿する</button>
      </div>

      {activeTab === 'feed' && (
        <div>
          {posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#aaaaaa' }}>
              まだ投稿がないみたいや！<br/>君が最初の投稿をしてみよう！
            </div>
          )}

          {posts.map((post) => (
            <div key={post.id} style={{ border: '1px solid #444', padding: '15px', marginBottom: '15px', borderRadius: '8px', backgroundColor: '#1a1a1a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <h2 style={{ fontSize: '16px', margin: 0, color: '#ffffff' }}>🏪 {post.store}</h2>
                <span style={{ fontSize: '12px', color: '#aaaaaa' }}>{post.time}</span>
              </div>
              <p style={{ margin: '10px 0', fontSize: '18px', color: '#ffffff' }}>{post.category}</p>
              <p style={{ color: '#ff4757', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>🏷️ {post.discount}</p>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  onClick={() => toggleLike(post.id, post.likes)}
                  style={{ backgroundColor: likedPostIds.includes(post.id) ? '#ff4757' : 'transparent', color: likedPostIds.includes(post.id) ? '#ffffff' : '#ff4757', border: '1px solid #ff4757', borderRadius: '20px', padding: '5px 15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s' }}
                >
                  {likedPostIds.includes(post.id) ? '❤️ いいね済み' : '🤍 いいね'} {post.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'post' && (
        <div>
          <div style={{ display: 'flex', marginBottom: '20px', gap: '5px' }}>
            {[1, 2, 3, 4].map((s) => (
              <div key={s} style={{ flex: 1, height: '5px', backgroundColor: step >= s ? '#ff4757' : '#444', borderRadius: '5px' }}></div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <h2 style={h2Style}>どこで見つけた？（地図を動かしてな！）</h2>
              <MapComponent onLocationSelect={(coords) => setSelectedCoords(coords)} />
              <button style={{...buttonStyle, backgroundColor: '#ff4757', color: 'white', WebkitTextFillColor: 'white', textAlign: 'center'}} onClick={() => goToNextStep(setSelectedStation, '地図で選んだ場所')}>📍 ここで決定！</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={h2Style}>お店の名前は？</h2>
              {['まいばすけっと', 'ダイエー', 'オオゼキ', 'その他'].map((store) => (
                <button key={store} style={buttonStyle} onClick={() => goToNextStep(setSelectedStore, store)}>🏪 {store}</button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={h2Style}>何が安かった？ ({selectedStore})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {categories.map((cat) => (
                  <button key={cat.id} style={{...buttonStyle, textAlign: 'center', padding: '20px 10px'}} onClick={() => goToNextStep(setSelectedCategory, `${cat.name} ${cat.icon}`)}>
                    <div style={{ fontSize: '32px', marginBottom: '5px' }}>{cat.icon}</div>
                    <div style={{ fontSize: '16px', color: '#333333' }}>{cat.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={h2Style}>どのくらい安い？ ({selectedCategory})</h2>
              {discounts.map((discount) => (
                <button key={discount} style={{...buttonStyle}} onClick={() => goToNextStep(setSelectedDiscount, discount)}>
                  <span style={{color: discount.includes('半額') ? '#ff4757' : '#333333', fontWeight: discount.includes('半額') ? 'bold' : 'normal'}}>🏷️ {discount}</span>
                </button>
              ))}
            </div>
          )}

          {step === 5 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={h2Style}>この内容で投稿する？</h2>
              <div style={{ border: '1px solid #444', padding: '15px', borderRadius: '10px', textAlign: 'left', backgroundColor: '#1a1a1a', marginBottom: '20px' }}>
                <p style={{color: '#ffffff', margin: '5px 0'}}>🏪店: {selectedStore}</p>
                <p style={{color: '#ffffff', margin: '5px 0'}}>🛍️何: {selectedCategory}</p>
                <p style={{color: '#ff4757', fontWeight: 'bold', fontSize: '20px', margin: '5px 0'}}>🏷️割引: {selectedDiscount}</p>
              </div>
              <button style={{...buttonStyle, backgroundColor: '#ff4757', color: 'white', WebkitTextFillColor: 'white', fontWeight: 'bold', textAlign: 'center'}} onClick={handlePost}>
                👉 【 投稿する 】
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}