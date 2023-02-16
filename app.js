//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const date = require(__dirname + "/date.js");
const url="mongodb+srv://Abhinav:Abhinav888@abhinav.ci4foj9.mongodb.net/todolistDB";
const app = express();


  mongoose.set('strictQuery',false);
mongoose.connect(url,function(){
  console.log("connected");
});
const itemschema=new mongoose.Schema({
  name:String
});
const listSchema=new mongoose.Schema({
  name: String,
  items: [itemschema]
});
const Item=mongoose.model("item",itemschema);
const List=mongoose.model("list",listSchema);
const item1=new Item({
  name:"Welcome to your todolist"
});

const item2=new Item({
  name:"Hit the + button to aff a new item"
});
const item3=new Item({
  name:"<-- Hit this to delete an item"
});
const defaultItems=[item1,item2, item3];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const workItems = [];
app.get("/:customlistname",function(req,res){
const title=  _.capitalize(req.params.customlistname);
List.findOne({name:title},function(err,foundlist){

    if(!foundlist){
      //CREATE A NEW LIST
      console.log("doesnt exist");
      const list= new List({
        name:title,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+title);
    }else{
      //SHOW AN EXISTING LIST
    res.render("list",{listTitle:foundlist.name, newListItems:foundlist.items})
    }

});

});

app.get("/", function(req, res) {

Item.find({},function(err,items){
if(items.length===0){
  Item.insertMany(defaultItems ,function(err){
    if(err){
      console.log(err);
    }else{
      console.log("successfully entered values");
    };
  });
res.redirect("/");
}else{
  res.render("list", {listTitle:"Today", newListItems: items});
}
});


});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listname=req.body.list;
  const newitem=new Item({
    name:itemname
  });
  if(listname==="Today"){
    newitem.save();
    res.redirect('/');

  }else{
    List.findOne({name:listname},function(err,foundlist){
      if(!err){
        foundlist.items.push(newitem);
        foundlist.save();
        res.redirect("/"+listname);
      }
    });
  }
});
app.post("/delete",function(req,res){
const listName=req.body.ListName;
const checkitemid=(req.body.checkbox);
if(listName==="Today"){
  Item.remove({_id:checkitemid},function(err){
    if(!err){
      console.log("successfully deleted");
    };
  });
  res.redirect("/");


}else{
List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkitemid}}},function(err,foundlist){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
