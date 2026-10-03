const mongoose=require("mongoose");
const pdfSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    title:String,
    url:{type:String,required:true},
    content:{type:String,default:""},
    publicId:{type:String,required:true},
     pages: Number,
     analysis: {
  score: Number,
  summary: String,
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
}
},{timestamps:true});

module.exports=new mongoose.model("Pdf",pdfSchema)