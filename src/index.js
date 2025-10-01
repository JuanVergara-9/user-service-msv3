require('dotenv').config();
const express=require('express'); const cors=require('cors'); const helmet=require('helmet'); const morgan=require('morgan');
const { v4: uuidv4 } = require('uuid'); const { sequelize } = require('../models');
const userRoutes = require('./routes/user.routes');

const app=express(); const PORT=process.env.PORT||4002;
app.use(cors({ origin:(o,cb)=>cb(null,true), credentials:true }));
app.use(helmet()); app.use(express.json());
app.use((req,res,next)=>{ req.id=req.headers['x-request-id']||uuidv4(); res.set('x-request-id',req.id); next(); });
app.use(morgan(':method :url :status - :response-time ms - :req[x-request-id]'));

app.get('/healthz', (_req,res)=>res.json({ok:true,service:'user-service'}));
app.get('/readyz', async (_req,res)=>{ try{ await sequelize.authenticate(); res.json({ok:true}); } catch{ res.status(503).json({ok:false}); }});

app.use('/api/v1/users', userRoutes);

// error handler
app.use((err,_req,res,_next)=>{ const s=err.status||500; res.status(s).json({ error:{ code:err.code||'INTERNAL_ERROR', message:err.message||'Internal error'}}); });

app.listen(PORT, ()=>console.log(`user-service on :${PORT}`));
